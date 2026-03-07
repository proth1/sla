@structural
Feature: Structural Validation — Onboarding v8 (Camunda 8)
  As a governance process engineer
  I want to validate the BPMN model is structurally sound
  So that the process deploys without errors to Camunda 8

  Background:
    Given the BPMN file "onboarding-to-be-ideal-state-v8-c8.bpmn" is loaded

  # --- Connectivity ---

  Scenario: All sequence flows have valid source and target references
    Then every sequence flow has a sourceRef that matches an existing element
    And every sequence flow has a targetRef that matches an existing element

  Scenario: No orphan elements exist in the enterprise process
    Then every task in process "Process_Onboarding_v8" has at least one incoming flow
    And every task in process "Process_Onboarding_v8" has at least one outgoing flow

  Scenario: No orphan elements exist in the vendor process
    Then every task in process "Process_Vendor" has at least one incoming flow
    And every task in process "Process_Vendor" has at least one outgoing flow

  Scenario: Start events have no incoming flows
    Then every start event has exactly 0 incoming flows

  Scenario: End events have no outgoing flows
    Then every end event has exactly 0 outgoing flows

  Scenario: Start events have exactly one outgoing flow
    Then every start event has exactly 1 outgoing flow

  # --- Process structure ---

  Scenario: Enterprise process has exactly one top-level start event
    Then process "Process_Onboarding_v8" has exactly 1 top-level start event

  Scenario: Enterprise process has the correct number of top-level end events
    Then process "Process_Onboarding_v8" has at least 3 top-level end events

  Scenario: Vendor process has exactly one start event
    Then process "Process_Vendor" has exactly 1 top-level start event

  Scenario: Vendor process has exactly two end events
    Then process "Process_Vendor" has exactly 2 top-level end events

  # --- Namespace ---

  Scenario: Model uses Zeebe namespace for Camunda 8
    Then the BPMN definitions include the Zeebe namespace "http://camunda.org/schema/zeebe/1.0"

  Scenario: Enterprise process is executable
    Then process "Process_Onboarding_v8" has isExecutable set to "true"

  Scenario: Vendor process is executable
    Then process "Process_Vendor" has isExecutable set to "true"

  # --- Element counts ---

  Scenario: Model contains the expected number of sub-processes
    Then process "Process_Onboarding_v8" contains exactly 5 collapsed sub-processes

  Scenario: Model contains the expected collaboration with two participants
    Then the collaboration has exactly 2 participants

  Scenario: Model contains 4 message flows between pools
    Then the collaboration has exactly 4 message flows
