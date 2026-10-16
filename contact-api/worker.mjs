import { recipient } from '../content/contact.mjs';

const origins = ['https://typeworks.pro', 'https://www.typeworks.pro'];
const limits = { company: 120, name: 80, email: 254, projectType: 40, budget: 100, timeline: 100, message: 6000, website: 200 };
const projectTypes = ['맞춤 소프트웨어', '업무 도구와 AI', '공연과 현장 운영', '상담 후 결정'];
const maxBytes = 32768;
const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
const escapeHtml = (text) => text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

async function readBody(request) {
  if (Number(request.headers.get('Content-Length')) > maxBytes) throw new Error('too_large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid');
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error('too_large');
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}

function validate(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const values = {};
  for (const [key, max] of Object.entries(limits)) {
    const value = input[key] ?? '';
    if (typeof value !== 'string' || value.length > max) return null;
    values[key] = value.trim();
    if (key !== 'message' && /[\x00-\x1f\x7f]/.test(value)) return null;
  }
  if (!values.company || !values.name || !values.message || values.website) return null;
  if (!emailPattern.test(values.email) || !projectTypes.includes(values.projectType)) return null;
  return values;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowedOrigins = env.LOCAL_ORIGIN ? [env.LOCAL_ORIGIN] : origins;
    const allowed = allowedOrigins.includes(origin);
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    if (allowed) headers['Access-Control-Allow-Origin'] = origin;
    const respond = (status, data, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...headers, ...extra } });
    const path = new URL(request.url).pathname;
    if (path === '/health' && request.method === 'GET') {
      const ready = Boolean(env.EMAIL && env.CONTACT_RATE_LIMITER);
      return respond(ready ? 200 : 503, { ready });
    }
    if (path !== '/api/contact') return respond(404, { ok: false, code: 'not_found' });
    if (!allowed) return respond(403, { ok: false, code: 'origin' });
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' } });
    }
    if (request.method !== 'POST') return respond(405, { ok: false, code: 'method' }, { Allow: 'POST, OPTIONS' });
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return respond(415, { ok: false, code: 'content_type' });
    if (!env.EMAIL || !env.CONTACT_RATE_LIMITER) return respond(503, { ok: false, code: 'unavailable' });

    let values;
    try {
      values = validate(await readBody(request));
    } catch (error) {
      return respond(error.message === 'too_large' ? 413 : 400, { ok: false, code: 'invalid' });
    }
    if (!values) return respond(400, { ok: false, code: 'invalid' });
    try {
      const ip = request.headers.get('CF-Connecting-IP');
      if (!ip) return respond(503, { ok: false, code: 'unavailable' });
      const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: ip });
      if (!success) return respond(429, { ok: false, code: 'rate_limit' }, { 'Retry-After': '60' });
      const rows = [
        ['회사 또는 소속', values.company], ['성함', values.name], ['이메일', values.email],
        ['필요한 작업', values.projectType], ['예산', values.budget || '상담 후 결정'],
        ['희망 일정', values.timeline || '상담 후 결정'], ['현재 상황과 원하는 결과', values.message],
      ];
      await env.EMAIL.send({
        from: { email: 'forms@typeworks.pro', name: 'Typeworks 상담' },
        to: recipient,
        replyTo: { email: values.email, name: values.name },
        subject: `[Typeworks 상담] ${values.company} / ${values.name}`,
        text: ['타입웍스 프로젝트 상담', '', ...rows.map(([label, value]) => `${label}\n${value}\n`)].join('\n'),
        html: `<h1>타입웍스 프로젝트 상담</h1>${rows.map(([label, value]) => `<h2>${label}</h2><p style="white-space:pre-wrap">${escapeHtml(value)}</p>`).join('')}`,
      });
      console.info(JSON.stringify({ event: 'contact_sent' }));
      return respond(200, { ok: true });
    } catch (error) {
      console.error(JSON.stringify({ event: 'contact_send_failed', code: typeof error.code === 'string' ? error.code : 'unavailable' }));
      return respond(502, { ok: false, code: 'send_failed' });
    }
  },
};
