#!/usr/bin/env python3
"""
v18 SLA Timer Transformation Script

Transforms onboarding-to-be-ideal-state-v17-c8.bpmn into v18 by adding:
1. Phase-level boundary timers (Reminder/Escalation/Deadline) on each subprocess
2. Per-timer service tasks (sla-phase-notification) + end events
3. Per-task SLA metadata as zeebe:property elements
4. DI shapes/edges for all new elements
5. Expanded pool height to accommodate timer visuals

Text-based BPMN transformation (no lxml) per project standards.
"""
import json
import re
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, 'sla-timer-config.json')
INPUT_PATH = os.path.join(SCRIPT_DIR, '..', 'customers', 'fs-onboarding', 'processes',
                          'onboarding-to-be-ideal-state-v17-c8.bpmn')
OUTPUT_PATH = os.path.join(SCRIPT_DIR, '..', 'customers', 'fs-onboarding', 'processes',
                           'onboarding-to-be-ideal-state-v18-c8.bpmn')

# Phase subprocess info: (id, slaConfigKey, short_label)
PHASE_SPS = [
    ('SP_RequestTriage',    'sp1',  'SP1'),
    ('SP_PlanningRouting',  'sp2',  'SP2'),
    ('Activity_02eupjn',   'spVS', 'VS'),
    ('SP_EvalDD',          'sp3',  'SP3'),
    ('Activity_19ph1cx',   'sp4',  'SP4'),
    ('SP_UATGoLive',       'sp5',  'SP5'),
]

# Timer tiers
TIERS = ['Reminder', 'Escalation', 'Deadline']


def load_config():
    with open(CONFIG_PATH, 'r') as f:
        return json.load(f)


def load_bpmn():
    with open(INPUT_PATH, 'r') as f:
        return f.read()


def update_version_refs(bpmn):
    """Update v17 → v18 in process ID, name, collaboration, definitions."""
    bpmn = bpmn.replace('Process_Onboarding_v17', 'Process_Onboarding_v18')
    bpmn = bpmn.replace('Collaboration_IdealState_v17', 'Collaboration_IdealState_v18')
    bpmn = bpmn.replace('Definitions_IdealState_v17', 'Definitions_IdealState_v18')
    bpmn = bpmn.replace(
        'Software Onboarding v17 (Camunda 8)',
        'Software Onboarding v18 (Camunda 8)'
    )
    return bpmn


def generate_boundary_timer_xml(sp_id, config_key, tier):
    """Generate a boundary timer event element."""
    timer_id = f'Timer_{config_key}_{tier}'
    flow_id = f'Flow_{config_key}_{tier}'
    feel_expr = f'=slaConfig.{config_key}.{tier.lower()}Duration'
    name = f'Phase&#10;{tier}'

    cancel_attr = ' cancelActivity="false"'

    return f'''    <bpmn:boundaryEvent id="{timer_id}" name="{name}"{cancel_attr} attachedToRef="{sp_id}">
      <bpmn:outgoing>{flow_id}</bpmn:outgoing>
      <bpmn:timerEventDefinition id="TimerDef_{config_key}_{tier}">
        <bpmn:timeDuration xsi:type="bpmn:tFormalExpression">{feel_expr}</bpmn:timeDuration>
      </bpmn:timerEventDefinition>
    </bpmn:boundaryEvent>'''


def generate_service_task_xml(config_key, tier):
    """Generate a service task for SLA notification."""
    task_id = f'Notify_{config_key}_{tier}'
    flow_in = f'Flow_{config_key}_{tier}'
    flow_out = f'Flow_{config_key}_{tier}_End'
    name = f'{tier}&#10;Notification'

    return f'''    <bpmn:serviceTask id="{task_id}" name="{name}">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="sla-phase-notification" />
        <zeebe:taskHeaders>
          <zeebe:header key="tier" value="{tier.lower()}" />
          <zeebe:header key="phase" value="{config_key}" />
        </zeebe:taskHeaders>
      </bpmn:extensionElements>
      <bpmn:incoming>{flow_in}</bpmn:incoming>
      <bpmn:outgoing>{flow_out}</bpmn:outgoing>
    </bpmn:serviceTask>'''


def generate_end_event_xml(config_key, tier):
    """Generate an end event for SLA notification chain."""
    end_id = f'End_{config_key}_{tier}'
    flow_in = f'Flow_{config_key}_{tier}_End'
    name = f'{tier}&#10;Sent'

    return f'''    <bpmn:endEvent id="{end_id}" name="{name}">
      <bpmn:incoming>{flow_in}</bpmn:incoming>
    </bpmn:endEvent>'''


def generate_sequence_flows_xml(config_key, tier):
    """Generate sequence flows: timer → service → end."""
    timer_id = f'Timer_{config_key}_{tier}'
    task_id = f'Notify_{config_key}_{tier}'
    end_id = f'End_{config_key}_{tier}'
    flow_timer_task = f'Flow_{config_key}_{tier}'
    flow_task_end = f'Flow_{config_key}_{tier}_End'

    return f'''    <bpmn:sequenceFlow id="{flow_timer_task}" sourceRef="{timer_id}" targetRef="{task_id}" />
    <bpmn:sequenceFlow id="{flow_task_end}" sourceRef="{task_id}" targetRef="{end_id}" />'''


def add_sla_property_to_user_task(bpmn, task_id, sla_duration):
    """Add zeebe:property name="sla" to a user task's extension elements."""
    sla_prop = f'<zeebe:property name="sla" value="{sla_duration}" />'

    # Check if task already has zeebe:properties
    # Pattern: find the userTask block and its zeebe:properties
    task_pattern = rf'(<bpmn:userTask id="{re.escape(task_id)}"[^>]*>)'
    task_match = re.search(task_pattern, bpmn)
    if not task_match:
        print(f'  WARNING: User task {task_id} not found, skipping SLA property')
        return bpmn

    # Find the position after the task opening tag
    task_start = task_match.start()

    # Look for existing zeebe:properties within this task's extension elements
    # Find the closing tag for this task
    task_close_pattern = r'</bpmn:userTask>'
    # Find the next closing tag after task_start
    remaining = bpmn[task_start:]

    # Check if zeebe:properties exists
    props_match = re.search(r'(<zeebe:properties>)(.*?)(</zeebe:properties>)',
                           remaining, re.DOTALL)

    if props_match:
        # Check if sla property already exists
        if 'name="sla"' in props_match.group(0):
            return bpmn

        # Insert before closing </zeebe:properties>
        insert_pos = task_start + props_match.start(3)
        indent = '            '
        bpmn = bpmn[:insert_pos] + f'{indent}{sla_prop}\n          ' + bpmn[insert_pos:]
    else:
        # Check if extensionElements exists
        ext_match = re.search(r'(<bpmn:extensionElements>)', remaining)
        ext_close_match = re.search(r'(</bpmn:extensionElements>)', remaining)

        if ext_match and ext_close_match:
            # Add zeebe:properties block before </bpmn:extensionElements>
            insert_pos = task_start + ext_close_match.start()
            indent = '          '
            block = f'{indent}<zeebe:properties>\n{indent}  {sla_prop}\n{indent}</zeebe:properties>\n        '
            bpmn = bpmn[:insert_pos] + block + bpmn[insert_pos:]
        else:
            # No extensionElements at all — add after the opening tag
            insert_pos = task_start + task_match.end()
            indent = '        '
            block = (f'\n{indent}<bpmn:extensionElements>\n'
                    f'{indent}  <zeebe:properties>\n'
                    f'{indent}    {sla_prop}\n'
                    f'{indent}  </zeebe:properties>\n'
                    f'{indent}</bpmn:extensionElements>')
            bpmn = bpmn[:insert_pos] + block + bpmn[insert_pos:]

    return bpmn


def get_sp_position(bpmn, sp_id):
    """Extract the DI position of a subprocess from the BPMN."""
    # Look for the BPMNShape with this bpmnElement
    pattern = rf'bpmnElement="{re.escape(sp_id)}"[^>]*>\s*<dc:Bounds x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"'
    match = re.search(pattern, bpmn)
    if match:
        return {
            'x': int(match.group(1)),
            'y': int(match.group(2)),
            'w': int(match.group(3)),
            'h': int(match.group(4)),
        }
    return None


def generate_di_shapes(config_key, sp_pos, tier_idx):
    """Generate DI shapes for timer, service task, and end event."""
    tier = TIERS[tier_idx]
    timer_id = f'Timer_{config_key}_{tier}'
    task_id = f'Notify_{config_key}_{tier}'
    end_id = f'End_{config_key}_{tier}'

    # Timer position: along bottom edge of SP, spaced left-to-right
    # SP is 100px wide. 3 timers at offsets 14, 42, 70 from SP_x
    timer_x = sp_pos['x'] + 14 + (tier_idx * 28)
    timer_y = sp_pos['y'] + sp_pos['h'] - 18  # centered on bottom edge

    # Service task: below and slightly right of timer
    task_x = sp_pos['x'] - 10 + (tier_idx * 40)
    task_y = sp_pos['y'] + sp_pos['h'] + 50  # 50px below SP bottom

    # End event: below service task
    end_x = task_x + 32
    end_y = task_y + 60

    shapes = f'''      <bpmndi:BPMNShape id="{timer_id}_di" bpmnElement="{timer_id}">
        <dc:Bounds x="{timer_x}" y="{timer_y}" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="{timer_x + 36}" y="{timer_y + 6}" width="44" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="{task_id}_di" bpmnElement="{task_id}">
        <dc:Bounds x="{task_x}" y="{task_y}" width="80" height="40" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="{end_id}_di" bpmnElement="{end_id}">
        <dc:Bounds x="{end_x}" y="{end_y}" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="{end_x - 10}" y="{end_y + 40}" width="56" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>'''
    return shapes


def generate_di_edges(config_key, sp_pos, tier_idx):
    """Generate DI edges for timer → service → end flows."""
    tier = TIERS[tier_idx]
    flow_timer_task = f'Flow_{config_key}_{tier}'
    flow_task_end = f'Flow_{config_key}_{tier}_End'

    timer_x = sp_pos['x'] + 14 + (tier_idx * 28) + 18  # center of timer
    timer_y = sp_pos['y'] + sp_pos['h'] - 18 + 36  # bottom of timer

    task_x = sp_pos['x'] - 10 + (tier_idx * 40)
    task_y = sp_pos['y'] + sp_pos['h'] + 50
    task_cx = task_x + 40  # center x
    task_bottom = task_y + 40

    end_x = task_x + 32 + 18  # center of end event
    end_y = task_y + 60

    edges = f'''      <bpmndi:BPMNEdge id="{flow_timer_task}_di" bpmnElement="{flow_timer_task}">
        <di:waypoint x="{timer_x}" y="{timer_y}" />
        <di:waypoint x="{timer_x}" y="{task_y + 20}" />
        <di:waypoint x="{task_x}" y="{task_y + 20}" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="{flow_task_end}_di" bpmnElement="{flow_task_end}">
        <di:waypoint x="{task_cx}" y="{task_bottom}" />
        <di:waypoint x="{end_x}" y="{end_y}" />
      </bpmndi:BPMNEdge>'''
    return edges


def expand_pool(bpmn):
    """Expand the enterprise pool height to accommodate timer elements."""
    # Current: height="280" → need height="480" for timer chain below SPs
    bpmn = re.sub(
        r'(bpmnElement="Participant_Enterprise"[^>]*>\s*<dc:Bounds[^>]*height=")280(")',
        r'\g<1>480\2',
        bpmn
    )
    return bpmn


def shift_rejection_events_down(bpmn):
    """Move rejection end events down by 130px to make room for timer elements."""
    # These are the end events at y=262 that need to move to y=392
    rejection_events = [
        'End_Rejected', 'End_VendorNotSelected', 'Event_0dh7yxn',
        'Event_1mg05vs', 'End_FinalRejected'
    ]
    for evt_id in rejection_events:
        # Shift the shape y from 262 to 392
        pattern = rf'(bpmnElement="{re.escape(evt_id)}"[^>]*>\s*<dc:Bounds[^>]*y=")262(")'
        bpmn = re.sub(pattern, r'\g<1>392\2', bpmn)
        # Shift the label y from 305 to 435
        # Find the label within the shape block — need to be more specific
        # Look for the label that follows this shape
        shape_pattern = rf'(bpmnElement="{re.escape(evt_id)}".*?<bpmndi:BPMNLabel>\s*<dc:Bounds[^>]*y=")305(")'
        bpmn = re.sub(shape_pattern, r'\g<1>435\2', bpmn, flags=re.DOTALL)

    # Also shift the edges that target these events
    # Edges with waypoint y="280" (rejection L-shape drop) → y="410"
    # Edges with waypoint y="262" → y="392"
    # This is trickier — we need to find edges that reference rejection flows
    # Let's handle the specific rejection flow edges
    rejection_flows = ['Flow_v5_4', 'Flow_0n4t7p0', 'Flow_05xumau', 'Flow_13fxwvf', 'Flow_v5_16']
    for flow_id in rejection_flows:
        # Find the edge block and shift y=280 waypoints to y=410, y=262 to y=392
        edge_pattern = rf'(bpmnElement="{re.escape(flow_id)}".*?</bpmndi:BPMNEdge>)'
        match = re.search(edge_pattern, bpmn, re.DOTALL)
        if match:
            edge_block = match.group(0)
            new_block = edge_block.replace('y="280"', 'y="410"').replace('y="262"', 'y="392"')
            bpmn = bpmn.replace(edge_block, new_block)

    return bpmn


def main():
    print('=== v18 SLA Timer Transformation ===')
    print()

    config = load_config()
    bpmn = load_bpmn()

    # Count elements before
    before_count = bpmn.count('bpmnElement=')
    print(f'Input: {os.path.basename(INPUT_PATH)}')
    print(f'Elements before: {before_count}')
    print()

    # 1. Update version references
    print('1. Updating version v17 → v18...')
    bpmn = update_version_refs(bpmn)

    # 2. Expand pool and shift rejection events
    print('2. Expanding pool height and shifting rejection events...')
    bpmn = expand_pool(bpmn)
    bpmn = shift_rejection_events_down(bpmn)

    # 3. Get subprocess positions for DI
    sp_positions = {}
    for sp_id, config_key, label in PHASE_SPS:
        pos = get_sp_position(bpmn, sp_id)
        if pos:
            sp_positions[sp_id] = pos
            print(f'   {label} ({sp_id}): x={pos["x"]}, y={pos["y"]}')
        else:
            print(f'   WARNING: {sp_id} position not found!')

    # 4. Generate process-level elements (timers, service tasks, end events, flows)
    print()
    print('3. Adding phase-level boundary timers...')
    process_elements = []
    for sp_id, config_key, label in PHASE_SPS:
        process_elements.append(f'    <!-- SLA Timers: {label} -->')
        for tier in TIERS:
            process_elements.append(generate_boundary_timer_xml(sp_id, config_key, tier))
            process_elements.append(generate_service_task_xml(config_key, tier))
            process_elements.append(generate_end_event_xml(config_key, tier))
            process_elements.append(generate_sequence_flows_xml(config_key, tier))
        print(f'   Added 3 timers + 3 service tasks + 3 end events for {label}')

    # Insert before </bpmn:process>
    process_block = '\n'.join(process_elements)
    bpmn = bpmn.replace('  </bpmn:process>', f'{process_block}\n  </bpmn:process>', 1)

    # 5. Add per-task SLA metadata
    print()
    print('4. Adding per-task SLA zeebe:properties...')
    task_slas = config.get('taskSLAs', {})
    added_count = 0
    for task_id, task_config in task_slas.items():
        sla = task_config['sla']
        before_len = len(bpmn)
        bpmn = add_sla_property_to_user_task(bpmn, task_id, sla)
        if len(bpmn) != before_len:
            added_count += 1
    print(f'   Added SLA properties to {added_count}/{len(task_slas)} user tasks')

    # 6. Generate DI elements
    print()
    print('5. Adding DI shapes and edges...')
    di_shapes = []
    di_edges = []
    for sp_id, config_key, label in PHASE_SPS:
        if sp_id not in sp_positions:
            continue
        sp_pos = sp_positions[sp_id]
        for tier_idx in range(len(TIERS)):
            di_shapes.append(generate_di_shapes(config_key, sp_pos, tier_idx))
            di_edges.append(generate_di_edges(config_key, sp_pos, tier_idx))

    # Insert DI elements before the closing of BPMNPlane_Main
    di_block = '\n'.join(di_shapes) + '\n' + '\n'.join(di_edges)

    # Find the closing tag of the main BPMNPlane
    main_plane_close = '    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>'
    if main_plane_close in bpmn:
        bpmn = bpmn.replace(main_plane_close,
                           f'{di_block}\n{main_plane_close}', 1)
        print(f'   Added {len(PHASE_SPS) * 3} timer shapes, {len(PHASE_SPS) * 3} task shapes, '
              f'{len(PHASE_SPS) * 3} end event shapes')
    else:
        print('   WARNING: Could not find main BPMNPlane closing tag for DI insertion')

    # Count elements after
    after_count = bpmn.count('bpmnElement=')
    print()
    print(f'Elements after: {after_count} (+{after_count - before_count})')

    # 7. Write output
    with open(OUTPUT_PATH, 'w') as f:
        f.write(bpmn)
    print(f'Output: {os.path.basename(OUTPUT_PATH)}')
    print(f'Size: {len(bpmn):,} bytes')
    print()
    print('Done! Open in Camunda Modeler to verify visual layout.')

    return 0


if __name__ == '__main__':
    sys.exit(main())
