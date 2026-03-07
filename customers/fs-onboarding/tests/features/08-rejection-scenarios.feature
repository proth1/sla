@rejection
Feature: Rejection Scenarios — All Rejection and Termination Paths
  As a governance officer
  I want to verify all rejection paths terminate correctly
  So that denied requests are properly closed with audit trail

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded

  # --- Top-level rejections ---

  Scenario: Triage rejection — request denied after SP1
    Then a valid path exists through these elements in order:
      | Start_SoftwareNeed   |
      | SP_RequestTriage     |
      | SendTask_SP1Complete |
      | GW_TriageDecision    |
      | End_Rejected         |

  Scenario: Speculative request — routed to idea funnel
    Then a valid path exists through these elements in order:
      | GW_RequestType       |
      | End_IdeaFunnel       |

  Scenario: Vendor not selected — after SP3 evaluation
    Then a valid path exists through these elements in order:
      | GW_VendorSelected    |
      | End_VendorNotSelected|

  Scenario: Evaluation rejected — after vendor selection
    Then a valid path exists through these elements in order:
      | GW_EvalApproved      |
      | End_EvalRejected     |

  Scenario: Final rejection — after SP5 UAT
    Then a valid path exists through these elements in order:
      | SP_UATGoLive         |
      | GW_FinalDecision     |
      | End_FinalRejected    |

  # --- Internal sub-process rejections ---

  Scenario: SP1 deal killer blocks request
    Then a valid path exists within sub-process "SP_RequestTriage" through:
      | Task_DealKillerCheck |
      | GW_DealKiller        |
      | End_DealKiller       |

  Scenario: SP5 approval rejected
    Then a valid path exists within sub-process "SP_UATGoLive" through:
      | Task_FinalApproval   |
      | GW_ApprovalDecision  |
      | End_SP5_Rejected     |

  # --- Vendor disqualified ---

  Scenario: Vendor disqualified after intake
    Then a valid path exists through these elements in order:
      | Start_VendorEngagement |
      | Task_VendorIntake      |
      | GW_VendorQualified     |
      | End_VendorDisqualified |

  # --- End event completeness ---

  Scenario: All top-level end events are named
    Then the end event "End_SoftwareOnboarded" has a name
    And the end event "End_FinalRejected" has a name
    And the end event "End_Rejected" has a name
    And the end event "End_VendorNotSelected" has a name
    And the end event "End_EvalRejected" has a name
    And the end event "End_IdeaFunnel" has a name

  Scenario: All rejection end events are reachable from the start event
    Then the element "End_Rejected" is reachable from "Start_SoftwareNeed"
    And the element "End_FinalRejected" is reachable from "Start_SoftwareNeed"
    And the element "End_VendorNotSelected" is reachable from "Start_SoftwareNeed"
    And the element "End_EvalRejected" is reachable from "Start_SoftwareNeed"
    And the element "End_IdeaFunnel" is reachable from "Start_SoftwareNeed"
