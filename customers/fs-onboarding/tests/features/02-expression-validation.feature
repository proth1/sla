@expression
Feature: Expression Validation — FEEL Syntax for Camunda 8
  As a Camunda 8 platform engineer
  I want all condition expressions to use FEEL syntax
  So that the process engine can evaluate gateway conditions at runtime

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded

  Scenario: No JUEL expressions exist in the model
    Then no condition expression uses JUEL syntax "${...}"

  Scenario: All condition expressions use FEEL syntax starting with "="
    Then every condition expression starts with "="

  Scenario Outline: Condition expression on flow "<flowId>" uses FEEL syntax
    Then the sequence flow "<flowId>" has a FEEL condition expression

    Examples:
      | flowId                |
      | Flow_SP5_Approved     |
      | Flow_SP5_Conditional  |
      | Flow_SP5_Rejected     |
      | Flow_SP1_CG_Yes       |
      | Flow_SP1_CG_No        |
      | Flow_SP1_DK_No        |
      | Flow_SP1_DK_Yes       |
      | Flow_SP3_SAR_Baseline |
      | Flow_SP3_SAR_Elevated |
      | Flow_SP4_CodingYes    |
      | Flow_SP4_CodingNo     |
      | Flow_SP4_Enable       |
      | Flow_v7_RT_Defined    |
      | Flow_v7_RT_Speculative|
      | Flow_v7_RT_Forced     |

  Scenario: PDLC test result gateway flows have no embedded conditions (merge gateway handles loop)
    Then the sequence flow "Flow_PDLC_Yes" exists
    And the sequence flow "Flow_PDLC_No" exists
