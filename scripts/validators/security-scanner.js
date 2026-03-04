#!/usr/bin/env node

/**
 * BPMN/DMN Security Scanner
 *
 * Detects injection vectors and unsafe patterns in BPMN 2.0 and DMN 1.3 XML:
 * - XXE (DOCTYPE/ENTITY declarations)
 * - Script task RCE (Groovy/JavaScript execution)
 * - JUEL expression injection (Runtime, ProcessBuilder, ClassLoader)
 * - Java class loading (camunda:class, delegateExpression)
 * - External script references (deployment://, classpath://)
 * - Executable listeners with method calls
 * - Complex expressions and connectors (warnings)
 *
 * Usage: node security-scanner.js <file.bpmn|file.dmn>
 *
 * Part of SLA Governance BPMN validation pipeline.
 */

import fs from 'fs';
import path from 'path';

// --- Check definitions ---

const CRITICAL_CHECKS = [
  {
    id: 'XXE_DOCTYPE',
    pattern: /<!DOCTYPE\b/i,
    message: 'DOCTYPE declaration detected (XXE vector)',
  },
  {
    id: 'XXE_ENTITY',
    pattern: /<!ENTITY\b/i,
    message: 'ENTITY declaration detected (XXE vector)',
  },
  {
    id: 'SCRIPT_TASK',
    pattern: /<bpmn:scriptTask\b[^>]*>/g,
    message: 'Script task detected (RCE risk)',
    extractId: true,
  },
  {
    id: 'JUEL_EXECUTE',
    pattern: /\$\{[^}]*\.execute\s*\([^}]*\}/g,
    message: 'JUEL .execute() call detected (code execution)',
  },
  {
    id: 'JUEL_RUNTIME',
    pattern: /\$\{[^}]*Runtime\.getRuntime\(\)[^}]*\}/g,
    message: 'Runtime.getRuntime() in expression (command injection)',
  },
  {
    id: 'JUEL_PROCESS_ENGINE',
    pattern: /\$\{[^}]*\.getProcessEngineServices\(\)[^}]*\}/g,
    message: 'getProcessEngineServices() in expression (engine access)',
  },
  {
    id: 'JUEL_PROCESS_BUILDER',
    pattern: /\$\{[^}]*ProcessBuilder[^}]*\}/g,
    message: 'ProcessBuilder in expression (command execution)',
  },
  {
    id: 'JUEL_JAVA_LANG',
    pattern: /\$\{[^}]*java\.lang\.[^}]*\}/g,
    message: 'java.lang.* in expression (reflection/execution)',
  },
  {
    id: 'JUEL_JAVA_IO',
    pattern: /\$\{[^}]*java\.io\.[^}]*\}/g,
    message: 'java.io.* in expression (file system access)',
  },
  {
    id: 'JUEL_THREAD',
    pattern: /\$\{[^}]*Thread\.[^}]*\}/g,
    message: 'Thread.* in expression (thread manipulation)',
  },
  {
    id: 'JUEL_SYSTEM_EXIT',
    pattern: /\$\{[^}]*System\.exit[^}]*\}/g,
    message: 'System.exit in expression (process termination)',
  },
  {
    id: 'JUEL_CLASSLOADER',
    pattern: /\$\{[^}]*ClassLoader[^}]*\}/g,
    message: 'ClassLoader in expression (class loading)',
  },
  {
    id: 'CAMUNDA_CLASS',
    pattern: /camunda:class\s*=\s*"([^"]*)"/g,
    message: 'camunda:class attribute detected (Java class loading)',
  },
  {
    id: 'CAMUNDA_DELEGATE',
    pattern: /camunda:delegateExpression\s*=\s*"([^"]*)"/g,
    message: 'camunda:delegateExpression detected (Java class loading)',
  },
];

const HIGH_CHECKS = [
  {
    id: 'LISTENER_EXPRESSION',
    pattern: /camunda:(?:executionListener|taskListener)[^>]*expression\s*=\s*"\$\{[^"]*\.[^"]*\("[^>]*/g,
    message: 'Listener with method call in expression',
  },
  {
    id: 'EXTERNAL_SCRIPT_DEPLOY',
    pattern: /resource\s*=\s*"deployment:\/\/[^"]*"/g,
    message: 'External script reference (deployment://) detected',
  },
  {
    id: 'EXTERNAL_SCRIPT_CLASSPATH',
    pattern: /resource\s*=\s*"classpath:\/\/[^"]*"/g,
    message: 'External script reference (classpath://) detected',
  },
  {
    id: 'CDATA_EXECUTABLE',
    pattern: /<!\[CDATA\[[\s\S]*?(?:Runtime|ProcessBuilder|exec\s*\(|java\.lang|System\.exit|ClassLoader)[\s\S]*?\]\]>/g,
    message: 'CDATA block contains executable pattern',
  },
];

const MEDIUM_CHECKS = [
  {
    id: 'COMPLEX_EXPRESSION',
    test: (xml) => {
      const findings = [];
      const exprRegex = /\$\{([^}]{150,})\}/g;
      let match;
      while ((match = exprRegex.exec(xml)) !== null) {
        findings.push({
          message: `Complex expression (${match[1].length} chars) — review recommended`,
          near: estimateLine(xml, match.index),
        });
      }
      return findings;
    },
  },
  {
    id: 'BOOLEAN_HEAVY_EXPRESSION',
    test: (xml) => {
      const findings = [];
      const exprRegex = /\$\{([^}]+)\}/g;
      let match;
      while ((match = exprRegex.exec(xml)) !== null) {
        const expr = match[1];
        const boolOps = (expr.match(/&&|\|\|/g) || []).length;
        if (boolOps >= 3) {
          findings.push({
            message: `Expression with ${boolOps} boolean operators — consider DMN table`,
            near: estimateLine(xml, match.index),
          });
        }
      }
      return findings;
    },
  },
  {
    id: 'CONNECTOR',
    pattern: /<camunda:connector\b/g,
    message: 'Camunda connector element detected — review endpoint configuration',
  },
  {
    id: 'XI_INCLUDE',
    pattern: /<xi:include\b/g,
    message: 'xi:include directive detected — external content inclusion',
  },
];

// DMN-specific checks (in addition to XXE checks which apply to both)
const DMN_CHECKS = [
  {
    id: 'FEEL_FUNCTION',
    pattern: /function\s*\(/g,
    message: 'FEEL function() call detected — review for injection',
  },
  {
    id: 'FEEL_INVOKE',
    pattern: /invoke\s*\(/g,
    message: 'FEEL invoke() call detected — review for injection',
  },
];

// --- Helpers ---

function estimateLine(xml, index) {
  return xml.substring(0, index).split('\n').length;
}

function extractElementId(xml, matchIndex) {
  // Look backward from match position for nearest id="..."
  const before = xml.substring(Math.max(0, matchIndex - 500), matchIndex);
  const idMatch = before.match(/id="([^"]*)"[^"]*$/);
  return idMatch ? idMatch[1] : 'unknown';
}

function runPatternChecks(xml, checks, severity) {
  const findings = [];

  for (const check of checks) {
    if (check.test) {
      // Custom test function
      const results = check.test(xml);
      for (const result of results) {
        findings.push({
          severity,
          id: check.id,
          message: result.message,
          near: result.near,
        });
      }
      continue;
    }

    const regex = new RegExp(check.pattern.source, check.pattern.flags);
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const elementId = check.extractId
        ? extractElementId(xml, match.index)
        : null;
      findings.push({
        severity,
        id: check.id,
        message: check.message + (elementId ? ` (${elementId})` : ''),
        near: estimateLine(xml, match.index),
      });

      // Non-global patterns: break after first match
      if (!check.pattern.flags.includes('g')) break;
    }
  }

  return findings;
}

// --- Main ---

function scan(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isDMN = ext === '.dmn';
  const fileType = isDMN ? 'DMN' : 'BPMN';

  const xml = fs.readFileSync(path.resolve(filePath), 'utf-8');
  const filename = path.basename(filePath);

  console.log('\n=== Security Scan Results ===');
  console.log(`  i Scanning: ${filename} (${fileType})`);

  const errors = [];
  const warnings = [];

  // XXE checks apply to both BPMN and DMN
  const xxeChecks = CRITICAL_CHECKS.filter(c =>
    c.id === 'XXE_DOCTYPE' || c.id === 'XXE_ENTITY'
  );
  errors.push(...runPatternChecks(xml, xxeChecks, 'CRITICAL'));

  if (isDMN) {
    // DMN-specific checks
    warnings.push(...runPatternChecks(xml, DMN_CHECKS, 'MEDIUM'));
  } else {
    // BPMN-specific checks
    const bpmnCritical = CRITICAL_CHECKS.filter(c =>
      c.id !== 'XXE_DOCTYPE' && c.id !== 'XXE_ENTITY'
    );
    errors.push(...runPatternChecks(xml, bpmnCritical, 'CRITICAL'));
    errors.push(...runPatternChecks(xml, HIGH_CHECKS, 'HIGH'));
    warnings.push(...runPatternChecks(xml, MEDIUM_CHECKS, 'MEDIUM'));
  }

  // Print results
  if (errors.length > 0) {
    console.log('ERRORS:');
    for (const err of errors) {
      console.log(`  x ${err.severity}: ${err.message} — near line ${err.near}`);
    }
  }

  if (warnings.length > 0) {
    console.log('WARNINGS:');
    for (const warn of warnings) {
      console.log(`  ! ${warn.severity}: ${warn.message} — near line ${warn.near}`);
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('OK: No security issues detected\n');
  } else if (errors.length === 0) {
    console.log(`OK: ${warnings.length} warning(s), no blocking issues\n`);
  } else {
    console.log(`FAILED: ${errors.length} issue(s)\n`);
  }

  return errors.length === 0 ? 0 : 1;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node security-scanner.js <file.bpmn|file.dmn>');
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const exitCode = scan(filePath);
  process.exit(exitCode);
}

main();
