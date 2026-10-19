export function inquiryPayload(form, locale) {
  const value = name => form.elements[name].value.trim();
  return {
    schemaVersion:2, locale,
    ...Object.fromEntries(['name','company','email','phone','budget','timeline','referenceNotes','message','website'].map(name => [name,value(name)])),
    projectType:'상담 후 결정',
    references:[...form.querySelectorAll('[name="references"]:checked')].map(input => input.value),
    referenceUnknown:form.elements.referenceUnknown.checked,
  };
}
export async function sendInquiry(endpoint, payload, {signal, fetchImpl = fetch} = {}) {
  const response = await fetchImpl(endpoint, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload),
    credentials:'omit', referrerPolicy:'origin', signal,
  });
  let data;
  try { data = await response.json(); } catch { throw new Error('send_failed'); }
  if (!response.ok || data?.ok !== true) throw new Error(response.status === 429 ? 'rate_limit' : 'send_failed');
}
