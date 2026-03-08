// Demo personas for the SLA Onboarding Showcase
// Each persona maps to specific Camunda candidateGroups

const PERSONAS = [
  {
    id: 'sarah.chen',
    name: 'Sarah Chen',
    title: 'VP, Global Markets Technology',
    initials: 'SC',
    color: '#3b82f6',
    groups: ['business-lane'],
    description: 'Business owner initiating software requests and approvals.',
  },
  {
    id: 'jennifer.martinez',
    name: 'Jennifer Martinez',
    title: 'Sr. Technology Governance Analyst',
    initials: 'JM',
    color: '#8b5cf6',
    groups: ['governance-lane', 'oversight-lane'],
    description: 'Governance reviews, audit oversight, and compliance sign-off.',
  },
  {
    id: 'marcus.johnson',
    name: 'Marcus Johnson',
    title: 'Chief Security Architect',
    initials: 'MJ',
    color: '#22c55e',
    groups: ['technical-assessment', 'ai-review'],
    description: 'Security assessments, architecture reviews, and AI governance.',
  },
  {
    id: 'lisa.park',
    name: 'Lisa Park',
    title: 'Compliance Officer',
    initials: 'LP',
    color: '#f59e0b',
    groups: ['compliance-lane'],
    description: 'Regulatory compliance checks and data privacy reviews.',
  },
  {
    id: 'david.kim',
    name: 'David Kim',
    title: 'Sr. Procurement Manager',
    initials: 'DK',
    color: '#ef4444',
    groups: ['contracting-lane', 'procurement-lane', 'finance-lane'],
    description: 'Contract negotiation, procurement, and financial analysis.',
  },
  {
    id: 'ahmed.saleh',
    name: 'Ahmed Saleh',
    title: 'Process Automation Lead',
    initials: 'AS',
    color: '#6366f1',
    groups: ['automation-lane'],
    description: 'Automated tasks, system integrations, and process orchestration.',
  },
  {
    id: 'vendor.demo',
    name: 'Vendor Demo',
    title: 'External Vendor Representative',
    initials: 'VD',
    color: '#ec4899',
    groups: ['vendor-response'],
    description: 'Vendor due diligence responses and contract execution.',
  },
];

// All-access persona for process owner view
const ALL_TASKS_PERSONA = {
  id: 'all',
  name: 'All Tasks',
  title: 'Process Owner View',
  initials: 'PO',
  color: '#64748b',
  groups: [],
  description: 'See all tasks across every lane.',
};

function getPersonaById(id) {
  if (id === 'all') return ALL_TASKS_PERSONA;
  return PERSONAS.find(p => p.id === id) || null;
}

function getPersonaGroups(personaId) {
  const p = getPersonaById(personaId);
  return p ? p.groups : [];
}
