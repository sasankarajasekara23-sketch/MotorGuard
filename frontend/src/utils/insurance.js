// Shared vehicle-insurance domain helpers used across the customer pages.

export const PLAN_META = {
  BASIC: {
    label: 'Basic',
    icon: '🛡️',
    gradient: 'from-slate-600 to-slate-500',
    tagline: 'Essential legal cover',
    benefits: ['Third-party injury liability', 'Third-party property damage', 'Legal defence costs'],
  },
  COMPREHENSIVE: {
    label: 'Comprehensive',
    icon: '⭐',
    gradient: 'from-blue-600 to-indigo-500',
    tagline: 'Full protection for you and your car',
    benefits: ['Accident & collision damage', 'Theft & fire', 'Flood, storm & natural disasters', 'Windscreen & glass', 'Third-party liability'],
  },
  THIRD_PARTY: {
    label: 'Third Party',
    icon: '✅',
    gradient: 'from-emerald-600 to-teal-500',
    tagline: 'Covers damage you cause to others',
    benefits: ['Third-party injury liability', 'Third-party property damage'],
  },
};

export const INCIDENT_TYPES = [
  { key: 'Accident', icon: '💥', hint: 'Collision or crash' },
  { key: 'Theft', icon: '🔓', hint: 'Vehicle or parts stolen' },
  { key: 'Fire', icon: '🔥', hint: 'Fire damage' },
  { key: 'Natural disaster', icon: '⛈️', hint: 'Flood, storm, landslide' },
  { key: 'Windscreen', icon: '🪟', hint: 'Glass damage' },
  { key: 'Third-party damage', icon: '🚧', hint: 'Damage to others' },
];

export const FEEDBACK_TOPICS = [
  { key: 'Claims', icon: '📝' },
  { key: 'Policy', icon: '🛡️' },
  { key: 'Payments', icon: '💳' },
  { key: 'Support', icon: '💬' },
  { key: 'Website', icon: '🖥️' },
];

// Optional "[Tag] " prefix convention used to categorise free-text fields
// (claim description, feedback comment) without changing the backend schema.
export const withTag = (tag, text) => (tag ? `[${tag}] ${text}` : text);

export const splitTag = (text, validTags) => {
  const match = /^\[([^\]]+)\]\s*/.exec(text || '');
  if (match && validTags.includes(match[1])) {
    return { tag: match[1], body: (text || '').slice(match[0].length) };
  }
  return { tag: null, body: text || '' };
};

export const policyNumber = (id) => (id ? `POL-${String(id).slice(0, 8).toUpperCase()}` : '—');

const MS_PER_DAY = 86400000;

export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const end = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((end - today) / MS_PER_DAY);
};

// 0..100 share of the policy term still remaining
export const termRemainingPercent = (startStr, endStr) => {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  if (!start || !end || end <= start) return 0;
  return Math.max(0, Math.min(100, ((end - Date.now()) / (end - start)) * 100));
};

export const vehicleAge = (year) => {
  const age = new Date().getFullYear() - Number(year);
  if (!Number.isFinite(age) || age < 0) return null;
  return age === 0 ? 'New' : `${age} yr${age === 1 ? '' : 's'} old`;
};

export const fileKind = (name = '', mime = '') => {
  const n = name.toLowerCase();
  if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|heic)$/.test(n)) return 'image';
  if (mime === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (/\.(docx?|txt|rtf)$/.test(n)) return 'doc';
  return 'file';
};
