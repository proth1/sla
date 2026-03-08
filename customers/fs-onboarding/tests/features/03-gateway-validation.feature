@gateway
Feature: Gateway Validation — Exclusive and Parallel Gateways
  As a process modeler
  I want every decision gateway to have complete routing logic
  So that no token gets stuck at a gateway during execution

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded

  # --- Decision gateways: must have default flow OR all outgoing flows conditioned ---

  Scenario Outline: Decision gateway "<gatewayId>" has a default flow or all outgoing flows have conditions
    Then the exclusive gateway "<gatewayId>" has either a default flow or all outgoing flows have conditions

    Examples: Top-level gateways
      | gatewayId          |
      | GW_TriageDecision  |
      | GW_BuyVsBuild      |
      | GW_VendorSelected  |
      | GW_EvalApproved    |
      | GW_FinalDecision   |
      | GW_RequestType     |

    Examples: SP1 gateways
      | gatewayId          |
      | GW_BypassProcess   |
      | GW_Complete        |
      | GW_DealKiller      |

    Examples: SP2 gateways
      | gatewayId          |
      | GW_NeedsAssessment |

    Examples: SP3 gateways
      | gatewayId          |
      | GW_SecurityLevel   |

    Examples: SP4 gateways
      | gatewayId          |
      | GW_PathwayExec     |
      | GW_CodingCorrect   |

    Examples: SP5 gateways
      | gatewayId           |
      | GW_ApprovalDecision |

    Examples: Vendor gateways
      | gatewayId           |
      | GW_VendorQualified  |

  # --- Merge gateways: exactly 1 outgoing, no name, no conditions ---

  Scenario Outline: Merge gateway "<gatewayId>" has exactly one unconditional outgoing flow
    Then the exclusive gateway "<gatewayId>" has exactly 1 outgoing flow
    And the exclusive gateway "<gatewayId>" has no name attribute

    Examples:
      | gatewayId              |
      | GW_MergeSubmit         |
      | GW_MergeBacklog        |
      | GW_MergeSecurityAssessment |
      | GW_MergeExec           |
      | GW_MergeOnboard        |
      | Gateway_0gh936r        |
      | Gateway_0q35ha8        |

  # --- Parallel gateways: balanced split/join ---

  Scenario: SP3 parallel split has 6 outgoing flows
    Then the parallel gateway "GW_ParallelSplit" has exactly 6 outgoing flows

  Scenario: SP3 parallel join has 6 incoming flows
    Then the parallel gateway "GW_ParallelJoin" has exactly 6 incoming flows

  Scenario: Vendor parallel split has 3 outgoing flows
    Then the parallel gateway "GW_VendorParSplit" has exactly 3 outgoing flows

  Scenario: Vendor parallel join has 3 incoming flows
    Then the parallel gateway "GW_VendorParJoin" has exactly 3 incoming flows

  # --- Gateway naming convention ---

  Scenario: Decision gateways use question-style names
    Then every named exclusive gateway has a name ending with "?"
