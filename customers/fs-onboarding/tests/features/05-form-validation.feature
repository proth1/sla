@form
Feature: Form Validation — Zeebe Form References
  As a Camunda 8 Tasklist administrator
  I want every user task with a form reference to point to an existing form file
  So that users see the correct form when claiming a task

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded
    And the forms directory "forms/" is scanned

  Scenario: Every zeebe:formDefinition references an existing .form file
    Then every formId in the BPMN matches a file named "{formId}.form" in the forms directory

  Scenario: No orphan form files exist without a BPMN reference
    Then every .form file in the forms directory is referenced by at least one user task

  Scenario Outline: SP1 form reference "<formId>" resolves to a file
    Then the form file "<formId>.form" exists in the forms directory

    Examples:
      | formId                    |
      | sp1-review-existing       |
      | sp1-leverage-existing     |
      | sp1-gather-documentation  |
      | sp1-submit-request        |
      | sp1-completeness-gate     |
      | sp1-classify-request      |
      | sp1-initial-triage        |

  Scenario Outline: SP2 form reference "<formId>" resolves to a file
    Then the form file "<formId>.form" exists in the forms directory

    Examples:
      | formId                    |
      | sp2-preliminary-analysis  |
      | sp2-backlog-prioritization|

  Scenario Outline: SP3 form reference "<formId>" resolves to a file
    Then the form file "<formId>.form" exists in the forms directory

    Examples:
      | formId                     |
      | sp3-tech-arch-review       |
      | sp3-security-assessment    |
      | sp3-risk-compliance        |
      | sp3-financial-analysis     |
      | sp3-assess-vendor-landscape|
      | sp3-vendor-due-diligence   |
      | sp3-evaluate-vendor-response|
      | sp3-ai-governance-review   |

  Scenario Outline: SP4 form reference "<formId>" resolves to a file
    Then the form file "<formId>.form" exists in the forms directory

    Examples:
      | formId                     |
      | sp4-refine-requirements    |
      | sp4-perform-poc            |
      | sp4-tech-risk-eval         |
      | sp4-negotiate-contract     |
      | sp4-finalize-contract      |
      | sp4-define-build-reqs      |
      | sp4-compliance-review-enable|
      | sp4-contract-deviation     |
      | sp4-coding-correction      |

  Scenario Outline: SP5 form reference "<formId>" resolves to a file
    Then the form file "<formId>.form" exists in the forms directory

    Examples:
      | formId                     |
      | sp5-perform-uat            |
      | sp5-final-approval         |
      | sp5-condition-verification |
      | sp5-onboard-software       |
      | sp5-assign-ownership       |
      | sp5-close-request          |

  Scenario Outline: PDLC form reference "<formId>" resolves to a file
    Then the form file "<formId>.form" exists in the forms directory

    Examples:
      | formId            |
      | pdlc-arch-review  |
      | pdlc-development  |
      | pdlc-testing      |
      | pdlc-integration  |

  Scenario Outline: NDA form reference "<formId>" resolves to a file
    Then the form file "<formId>.form" exists in the forms directory

    Examples:
      | formId    |
      | nda-gate  |

  Scenario Outline: Vendor form reference "<formId>" resolves to a file
    Then the form file "<formId>.form" exists in the forms directory

    Examples:
      | formId                     |
      | vendor-intake              |
      | vendor-proposal            |
      | vendor-security-review     |
      | vendor-compliance-review   |
      | vendor-tech-demo           |
      | vendor-contract-review     |
      | vendor-contract-sign       |
      | vendor-onboarding          |
      | vendor-deploy-support      |
      | vendor-close-request       |
