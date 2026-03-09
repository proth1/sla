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

// --- Shared Persona UI (used by index.html, dashboard.html, etc.) ---

const _origFetch = window.fetch;
window.fetch = function(url, opts = {}) {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    const persona = localStorage.getItem('sla-persona');
    if (persona) {
      opts.headers = Object.assign({}, opts.headers || {}, { 'X-SLA-Persona': persona });
    }
  }
  return _origFetch.call(this, url, opts);
};

function showPersonaModal() {
  const modal = document.getElementById('personaModal');
  const grid = document.getElementById('personaGrid');
  grid.innerHTML = '';
  const all = [ALL_TASKS_PERSONA, ...PERSONAS];
  all.forEach(p => {
    const card = document.createElement('div');
    card.style.cssText = 'padding:14px;border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .2s;text-align:center';
    card.onmouseover = () => { card.style.borderColor = p.color; card.style.background = 'rgba(255,255,255,0.03)'; };
    card.onmouseout = () => { card.style.borderColor = 'var(--border)'; card.style.background = 'transparent'; };
    card.onclick = () => selectPersona(p);
    card.innerHTML = `<div style="width:36px;height:36px;border-radius:50%;background:${p.color};color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 8px">${p.initials}</div><div style="font-weight:600;font-size:13px;color:var(--text)">${p.name}</div><div style="font-size:11px;color:var(--text2);margin-top:2px">${p.title}</div>`;
    grid.appendChild(card);
  });
  modal.style.display = 'flex';
}

function selectPersona(p, onSelect) {
  if (p.id === 'all') {
    localStorage.removeItem('sla-persona');
  } else {
    localStorage.setItem('sla-persona', p.id);
  }
  updatePersonaBadge(p);
  document.getElementById('personaModal').style.display = 'none';
  if (typeof onSelect === 'function') onSelect(p);
}

function updatePersonaBadge(p) {
  const badge = document.getElementById('personaBadge');
  const avatar = document.getElementById('personaAvatar');
  const name = document.getElementById('personaName');
  if (!badge) return;
  badge.style.display = 'flex';
  avatar.style.background = p.color;
  avatar.textContent = p.initials;
  name.textContent = p.name;
}

function initPersona() {
  const saved = localStorage.getItem('sla-persona');
  if (saved) {
    const p = getPersonaById(saved);
    if (p) { updatePersonaBadge(p); return; }
  }
  updatePersonaBadge(ALL_TASKS_PERSONA);
}
