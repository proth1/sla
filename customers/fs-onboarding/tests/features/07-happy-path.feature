@happy-path
Feature: Happy Path Scenarios — Buy and Build Pathways
  As a governance analyst
  I want to verify complete execution paths exist through all 5 sub-processes
  So that a software onboarding request can be processed end-to-end

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded

  # --- Buy pathway (Defined Need) ---

  Scenario: Buy pathway — complete path from start to software onboarded
    Then a valid path exists through these elements in order:
      | Start_SoftwareNeed   |
      | SP_RequestTriage     |
      | SendTask_SP1Complete |
      | GW_TriageDecision    |
      | GW_RequestType       |
      | Task_ExecuteNDA      |
      | SP_PlanningRouting   |
      | SendTask_SP2Complete |
      | GW_BuyVsBuild        |
      | SP_EvalDD            |
      | SendTask_SP3Complete |
      | GW_VendorSelected    |
      | GW_EvalApproved      |
      | Gateway_0gh936r      |
      | SP_ContractBuild     |
      | SendTask_SP4Complete |
      | SP_UATGoLive         |
      | GW_FinalDecision     |
      | End_SoftwareOnboarded|

  # --- Build pathway ---

  Scenario: Build pathway — bypasses SP3 evaluation via "Do we Build?" gateway
    Then a valid path exists through these elements in order:
      | Start_SoftwareNeed   |
      | SP_RequestTriage     |
      | SendTask_SP1Complete |
      | GW_TriageDecision    |
      | GW_RequestType       |
      | Task_ExecuteNDA      |
      | SP_PlanningRouting   |
      | SendTask_SP2Complete |
      | GW_BuyVsBuild        |
      | Gateway_0gh936r      |
      | SP_ContractBuild     |
      | SendTask_SP4Complete |
      | SP_UATGoLive         |
      | GW_FinalDecision     |
      | End_SoftwareOnboarded|

  # --- Forced Update pathway ---

  Scenario: Forced Update pathway — skips NDA and Planning, goes directly to SP3
    Then a valid path exists through these elements in order:
      | Start_SoftwareNeed   |
      | SP_RequestTriage     |
      | SendTask_SP1Complete |
      | GW_TriageDecision    |
      | GW_RequestType       |
      | SP_EvalDD            |
      | SendTask_SP3Complete |
      | GW_VendorSelected    |
      | GW_EvalApproved      |
      | Gateway_0gh936r      |
      | SP_ContractBuild     |

  # --- SP1 internal happy path ---

  Scenario: SP1 happy path — formal process with deal killer passing
    Then a valid path exists within sub-process "SP_RequestTriage" through:
      | SP1_Start            |
      | Task_ReviewExisting  |
      | GW_BypassProcess     |
      | Task_GatherDocs      |
      | GW_MergeSubmit       |
      | Task_SubmitRequest   |
      | Task_CompletenessGate|
      | GW_Complete          |
      | Task_ClassifyRequest |
      | Task_DealKillerCheck |
      | GW_DealKiller        |
      | Task_InitialTriage   |
      | SP1_End              |

  # --- SP1 bypass path ---

  Scenario: SP1 bypass — leverage existing software
    Then a valid path exists within sub-process "SP_RequestTriage" through:
      | SP1_Start            |
      | Task_ReviewExisting  |
      | GW_BypassProcess     |
      | Task_LeverageExisting|
      | End_Leveraged        |

  # --- SP2 internal happy path ---

  Scenario: SP2 happy path — no backlog prioritization needed
    Then a valid path exists within sub-process "SP_PlanningRouting" through:
      | SP2_Start               |
      | Task_PrelimAnalysis     |
      | GW_NeedsAssessment      |
      | GW_MergeBacklog         |
      | Task_PrioritizationScoring |
      | Task_PathwayRouting     |
      | SP2_End                 |

  # --- SP2 with backlog ---

  Scenario: SP2 with backlog prioritization
    Then a valid path exists within sub-process "SP_PlanningRouting" through:
      | SP2_Start               |
      | Task_PrelimAnalysis     |
      | GW_NeedsAssessment      |
      | Task_Backlog            |
      | GW_MergeBacklog         |
      | Task_PrioritizationScoring |
      | Task_PathwayRouting     |
      | SP2_End                 |

  # --- SP3 internal happy path ---

  Scenario: SP3 happy path — parallel evaluation then vendor DD
    Then a valid path exists within sub-process "SP_EvalDD" through:
      | SP3_Start               |
      | Task_DARTFormation      |
      | GW_ParallelSplit        |
    And a valid path exists within sub-process "SP_EvalDD" through:
      | GW_ParallelJoin         |
      | Task_VendorDueDiligence |
      | Receive_VendorResponse  |
      | Task_EvaluateVendorResponse |
      | SP3_End                 |

  # --- SP4 Buy path ---

  Scenario: SP4 Buy path — refine, PoC, negotiate, finalize
    Then a valid path exists within sub-process "SP_ContractBuild" through:
      | SP4_Start               |
      | GW_PathwayExec          |
      | Task_RefineRequirements |
      | Task_PerformPoC         |
      | Task_TechRiskEval       |
      | Task_NegotiateContract  |
      | Receive_SignedContract  |
      | Task_FinalizeContract   |
      | Task_ContractDeviation  |
      | GW_CodingCorrect        |
      | GW_MergeExec            |
      | SP4_End                 |

  # --- SP4 Build path ---

  Scenario: SP4 Build path — define reqs then PDLC
    Then a valid path exists within sub-process "SP_ContractBuild" through:
      | SP4_Start               |
      | GW_PathwayExec          |
      | Task_DefineBuildReqs    |
      | SP_PDLC                 |
      | GW_MergeExec            |
      | SP4_End                 |

  # --- SP4 Enable path ---

  Scenario: SP4 Enable path — compliance review and execute
    Then a valid path exists within sub-process "SP_ContractBuild" through:
      | SP4_Start               |
      | GW_PathwayExec          |
      | Task_ComplianceReview   |
      | Task_EnableContractExec |
      | GW_MergeExec            |
      | SP4_End                 |

  # --- SP5 internal happy path ---

  Scenario: SP5 happy path — approved directly
    Then a valid path exists within sub-process "SP_UATGoLive" through:
      | SP5_Start               |
      | Task_PerformUAT         |
      | Task_FinalApproval      |
      | GW_ApprovalDecision     |
      | GW_MergeOnboard         |
      | Task_OnboardSoftware    |
      | Activity_0zf4l0g        |
      | Task_AssignOwnership    |
      | Task_CloseRequest       |
      | SP5_End                 |

  # --- SP5 conditional approval ---

  Scenario: SP5 conditional approval — verify conditions then onboard
    Then a valid path exists within sub-process "SP_UATGoLive" through:
      | SP5_Start               |
      | Task_PerformUAT         |
      | Task_FinalApproval      |
      | GW_ApprovalDecision     |
      | Task_ConditionVerification |
      | GW_MergeOnboard         |
      | Task_OnboardSoftware    |

  # --- PDLC internal happy path ---

  Scenario: PDLC happy path — tests pass on first attempt
    Then a valid path exists within sub-process "SP_PDLC" through:
      | PDLC_Start              |
      | PDLC_ArchReview         |
      | Gateway_0q35ha8         |
      | PDLC_Development        |
      | PDLC_Testing            |
      | PDLC_GW_TestResult      |
      | PDLC_Integration        |
      | PDLC_End                |

  # --- Notification tasks between sub-processes ---

  Scenario: Status notification tasks exist between all sub-processes
    Then the service task "SendTask_SP1Complete" has a zeebe:taskDefinition with type "status-notification"
    And the service task "SendTask_SP2Complete" has a zeebe:taskDefinition with type "status-notification"
    And the service task "SendTask_SP3Complete" has a zeebe:taskDefinition with type "status-notification"
    And the service task "SendTask_SP4Complete" has a zeebe:taskDefinition with type "status-notification"
