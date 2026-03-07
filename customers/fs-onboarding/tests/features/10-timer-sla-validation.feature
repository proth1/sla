@timer
Feature: Timer and SLA Validation — Boundary Timer Events
  As a process operations manager
  I want all SLA timers to be properly configured
  So that SLA breaches are detected and escalated automatically

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded

  # --- Boundary timer events ---

  Scenario: Vendor response SLA timer is attached to the receive task
    Then the boundary event "Timer_VendorResponseSLA" is attached to "Receive_VendorResponse"

  Scenario: Contract SLA timer is attached to the receive task
    Then the boundary event "Timer_ContractSLA" is attached to "Receive_SignedContract"

  # --- Non-interrupting timers ---

  Scenario: Vendor response SLA timer is non-interrupting
    Then the boundary event "Timer_VendorResponseSLA" has cancelActivity set to "false"

  Scenario: Contract SLA timer is non-interrupting
    Then the boundary event "Timer_ContractSLA" has cancelActivity set to "false"

  # --- Timer durations ---

  Scenario: Vendor response SLA is 5 days
    Then the timer event "Timer_VendorResponseSLA" has duration "P5D"

  Scenario: Contract SLA is 7 days
    Then the timer event "Timer_ContractSLA" has duration "P7D"

  Scenario: Triage SLA is 2 days
    Then the timer event "Timer_TriageSLA" has duration "P2D"

  # --- Outgoing flows ---

  Scenario: All timer events have at least one outgoing flow
    Then the boundary event "Timer_VendorResponseSLA" has at least 1 outgoing flow
    And the boundary event "Timer_ContractSLA" has at least 1 outgoing flow

  Scenario: Standalone triage timer has an outgoing flow
    Then the intermediate catch event "Timer_TriageSLA" has at least 1 outgoing flow

  # --- SLA breach end events ---

  Scenario: Vendor response SLA breach leads to an end event
    Then a valid path exists within sub-process "SP_EvalDD" through:
      | Timer_VendorResponseSLA       |
      | End_VendorResponseSLABreach   |

  Scenario: Contract SLA breach leads to an end event
    Then a valid path exists within sub-process "SP_ContractBuild" through:
      | Timer_ContractSLA       |
      | End_ContractSLABreach   |

  Scenario: Triage SLA escalation leads to an end event
    Then a valid path exists within sub-process "SP_RequestTriage" through:
      | Timer_TriageSLA              |
      | End_TriageSLAEscalation      |

  # --- ISO 8601 duration format ---

  Scenario: All timer durations are valid ISO 8601
    Then every timer duration matches the pattern "P(\d+[YMWD])?(T(\d+[HMS])?)?"
