@message
Feature: Message Validation — Receive Tasks and Message Events
  As a Camunda 8 engineer
  I want all receive tasks and message events to have proper message references
  So that the process can correlate incoming messages at runtime

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded

  # --- Receive tasks ---

  Scenario: Receive task "Receive_VendorResponse" has a message reference
    Then the receive task "Receive_VendorResponse" has a messageRef attribute

  Scenario: Receive task "Receive_SignedContract" has a message reference
    Then the receive task "Receive_SignedContract" has a messageRef attribute

  # --- Message start events ---

  Scenario: Vendor start event has a message event definition
    Then the start event "Start_VendorEngagement" has a messageEventDefinition

  # --- Message flows ---

  Scenario Outline: Message flow "<flowId>" references valid source and target elements
    Then the message flow "<flowId>" has a sourceRef that matches an existing element
    And the message flow "<flowId>" has a targetRef that matches an existing element

    Examples:
      | flowId                 |
      | MsgFlow_DDRequest      |
      | MsgFlow_VendorResponse |
      | MsgFlow_ContractDraft  |
      | MsgFlow_SignedContract |

  Scenario: Message flows cross pool boundaries (not within same pool)
    Then every message flow connects elements in different pools

  Scenario: All message flows have descriptive names
    Then every message flow has a name attribute
