@subprocess
Feature: Sub-Process Validation — Collapsed Sub-Processes and BPMNDiagrams
  As a BPMN modeler
  I want each collapsed sub-process to have its own BPMNDiagram with proper start/end events
  So that Camunda Modeler renders the internal diagrams correctly

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded

  # --- BPMNDiagram presence ---

  Scenario Outline: Sub-process "<spId>" has its own BPMNDiagram
    Then the sub-process "<spId>" has a dedicated BPMNDiagram element

    Examples:
      | spId              |
      | SP_RequestTriage   |
      | SP_PlanningRouting |
      | SP_EvalDD          |
      | SP_ContractBuild   |
      | SP_UATGoLive       |
      | SP_PDLC            |

  # --- Start/End events ---

  Scenario Outline: Sub-process "<spId>" has exactly one start event
    Then the sub-process "<spId>" contains exactly 1 start event

    Examples:
      | spId              |
      | SP_RequestTriage   |
      | SP_PlanningRouting |
      | SP_EvalDD          |
      | SP_ContractBuild   |
      | SP_UATGoLive       |
      | SP_PDLC            |

  Scenario Outline: Sub-process "<spId>" has at least one end event
    Then the sub-process "<spId>" contains at least 1 end event

    Examples:
      | spId              |
      | SP_RequestTriage   |
      | SP_PlanningRouting |
      | SP_EvalDD          |
      | SP_ContractBuild   |
      | SP_UATGoLive       |
      | SP_PDLC            |

  # --- SP counts ---

  Scenario: SP1 (Request and Triage) has the expected number of end events
    Then the sub-process "SP_RequestTriage" contains exactly 4 end events

  Scenario: SP2 (Planning and Routing) has 1 end event
    Then the sub-process "SP_PlanningRouting" contains exactly 1 end event

  Scenario: SP3 (Evaluation and Due Diligence) has the expected number of end events
    Then the sub-process "SP_EvalDD" contains exactly 2 end events

  Scenario: SP4 (Contracting and Build) has the expected number of end events
    Then the sub-process "SP_ContractBuild" contains exactly 2 end events

  Scenario: SP5 (UAT and Go-Live) has the expected number of end events
    Then the sub-process "SP_UATGoLive" contains exactly 2 end events

  Scenario: PDLC nested sub-process has 1 end event
    Then the sub-process "SP_PDLC" contains exactly 1 end event

  # --- Collapsed rendering ---

  Scenario: All top-level sub-processes are rendered as collapsed in the main diagram
    Then every sub-process shape in "BPMNDiagram_Main" has isExpanded set to "false"

  # --- No duplicate DI shape IDs ---

  Scenario: No duplicate shape IDs exist across all BPMNDiagrams
    Then there are no duplicate BPMNShape id attributes in the entire file

  # --- Nested sub-process ---

  Scenario: SP_PDLC is nested inside SP_ContractBuild
    Then the sub-process "SP_PDLC" is defined inside sub-process "SP_ContractBuild"
