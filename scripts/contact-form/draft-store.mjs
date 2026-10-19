const fieldLimits = {name:203, email:254, phone:40, referenceNotes:2000, budget:100, timeline:1000, message:6000};
export const draftFields = Object.keys(fieldLimits);
export const draftKey = 'typeworks:contact:v5';
export const legacyDraftKeys = ['typeworks:contact:four-step:v4','typeworks:contact:three-step:v3','typeworks:contact:three-step:v2','typeworks:contact:three-step:v1'];
const stepIndex = value => Number.isInteger(value) ? Math.max(0, Math.min(3, value)) : 0;

export function parseDraft(raw, allowedReferences) {
  let draft;
  try { draft = JSON.parse(raw); } catch { return null; }
  if (!draft || ![1, 2, 3, 4, 5].includes(draft.version) || !draft.values || typeof draft.values !== 'object' || Array.isArray(draft.values)) return null;
  const values = Object.fromEntries(draftFields.map(name => [name, typeof draft.values[name] === 'string' ? draft.values[name].slice(0, fieldLimits[name]) : '']));
  if (draft.version < 5) values.name = [typeof draft.values.name === 'string' ? draft.values.name.slice(0,80) : '', typeof draft.values.company === 'string' ? draft.values.company.slice(0,120) : ''].filter(Boolean).join(' / ');
  if (draft.version < 3) {
    const legacyParts = [['startTiming','착수 희망 시점'], ['projectDuration','희망 제작 기간'], ['targetCompletion','완료 희망 시점']]
      .filter(([name]) => typeof draft.values[name] === 'string' && draft.values[name].trim())
      .map(([name, label]) => `${label}: ${draft.values[name].slice(0, 100)}`);
    if (legacyParts.length) values.timeline = [values.timeline, ...legacyParts].filter(Boolean).join('\n').slice(0, fieldLimits.timeline);
  }
  const references = Array.isArray(draft.references) ? [...new Set(draft.references.filter(slug => allowedReferences.includes(slug)))] : [];
  const unknown = draft.unknown === true;
  return {version:5, phoneRegion:draft.phoneRegion === 'international' || (draft.version < 4 && values.phone.trim().startsWith('+')) ? 'international' : 'KR', editing:draft.editing === true, values, references:unknown ? [] : references, unknown, expanded:draft.expanded === true, step:stepIndex(draft.step), visited:stepIndex(draft.visited)};
}

export function loadDraft(key, allowedReferences, legacyKeys = []) {
  try {
    const keys = [key, ...(Array.isArray(legacyKeys) ? legacyKeys : [legacyKeys])].filter(Boolean);
    let raw = null;
    for (const candidate of keys) {
      raw = window.localStorage.getItem(candidate);
      if (raw !== null) break;
    }
    return {draft:raw ? parseDraft(raw, allowedReferences) : null, available:true};
  } catch {
    return {draft:null, available:false};
  }
}

export function saveDraft(key, draft) {
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}
