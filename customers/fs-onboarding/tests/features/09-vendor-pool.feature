@vendor
Feature: Vendor Pool Validation — Cross-Pool Communication
  As a vendor relationship manager
  I want the vendor pool to be properly connected to the enterprise pool
  So that vendor activities are coordinated with internal governance

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded

  # --- Vendor process structure ---

  Scenario: Vendor process has a message start event
    Then the start event "Start_VendorEngagement" has a messageEventDefinition

  Scenario: Vendor process has a complete flow from start to end
    Then a valid path exists through these elements in order:
      | Start_VendorEngagement  |
      | Task_VendorIntake       |
      | GW_VendorQualified      |
      | Task_VendorProposal     |
      | GW_VendorParSplit       |

  Scenario: Vendor process post-parallel join to completion
    Then a valid path exists through these elements in order:
      | GW_VendorParJoin         |
      | Task_VendorContractReview|
      | Task_VendorContractSign  |
      | Task_VendorOnboarding    |
      | Task_VendorDeploySupport |
      | Task_VendorCloseRequest  |
      | End_VendorComplete       |

  # --- Parallel vendor evaluation ---

  Scenario: Vendor parallel split fans out to 3 review tasks
    Then the parallel gateway "GW_VendorParSplit" has outgoing flows to:
      | Task_VendorSecurityReview   |
      | Task_VendorComplianceReview |
      | Task_VendorTechDemo         |

  Scenario: All 3 vendor review tasks join at the parallel join
    Then the parallel gateway "GW_VendorParJoin" has incoming flows from:
      | Task_VendorSecurityReview   |
      | Task_VendorComplianceReview |
      | Task_VendorTechDemo         |

  # --- Message flow direction ---

  Scenario: DD Request flows from enterprise to vendor
    Then the message flow "MsgFlow_DDRequest" has sourceRef in process "Process_Onboarding_v8"
    And the message flow "MsgFlow_DDRequest" has targetRef in process "Process_Vendor"

  Scenario: Vendor Response flows from vendor to enterprise
    Then the message flow "MsgFlow_VendorResponse" has sourceRef in process "Process_Vendor"
    And the message flow "MsgFlow_VendorResponse" has targetRef in process "Process_Onboarding_v8"

  Scenario: Contract Draft flows from enterprise to vendor
    Then the message flow "MsgFlow_ContractDraft" has sourceRef in process "Process_Onboarding_v8"
    And the message flow "MsgFlow_ContractDraft" has targetRef in process "Process_Vendor"

  Scenario: Signed Contract flows from vendor to enterprise
    Then the message flow "MsgFlow_SignedContract" has sourceRef in process "Process_Vendor"
    And the message flow "MsgFlow_SignedContract" has targetRef in process "Process_Onboarding_v8"

  # --- Vendor task assignments ---

  Scenario Outline: Vendor task "<taskId>" is assigned to vendor-response candidateGroup
    Then the user task "<taskId>" has candidateGroups "vendor-response"

    Examples:
      | taskId                       |
      | Task_VendorIntake            |
      | Task_VendorProposal          |
      | Task_VendorSecurityReview    |
      | Task_VendorComplianceReview  |
      | Task_VendorTechDemo          |
      | Task_VendorContractReview    |
      | Task_VendorContractSign      |
      | Task_VendorOnboarding        |
      | Task_VendorDeploySupport     |
      | Task_VendorCloseRequest      |
