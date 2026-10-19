import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.mjs';

const valid = { company: '테스트 회사', name: '점검 담당자', email: 'minseok@typeworks.pro', projectType: '맞춤 소프트웨어', budget: '', timeline: '', message: '상담 전송 기능 점검입니다.', website: '' };
const request = (body = valid, options = {}) => new Request('https://contact.test/api/contact', { method: 'POST', headers: { Origin: 'https://typeworks.pro', 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...options.headers }, body: typeof body === 'string' ? body : JSON.stringify(body), ...options });
const setup = () => {
  const sent = [];
  return { sent, env: { EMAIL: { send: async (mail) => { sent.push(mail); return { messageId: 'test-id' }; } }, CONTACT_RATE_LIMITER: { limit: async () => ({ success: true }) } } };
};

test('valid form sends only to the fixed inbox, preserves reply address and escapes HTML', async () => {
  const { env, sent } = setup();
  const response = await worker.fetch(request({ ...valid, message: '<script>alert("x")</script>\n둘째 줄', to: 'attacker@example.com' }), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'minseok@typeworks.pro');
  assert.equal(sent[0].from.email, 'forms@typeworks.pro');
  assert.equal(sent[0].replyTo.email, valid.email);
  assert.match(sent[0].text, /둘째 줄/);
  assert.match(sent[0].html, /&lt;script&gt;/);
  assert.doesNotMatch(sent[0].html, /<script>/);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('rejects invalid input, header injection, honeypot, wrong types and field limits before sending', async () => {
  const { env, sent } = setup();
  for (const body of [null, [], { ...valid, company: ' ' }, { ...valid, name: 'A\r\nBcc: attacker@example.com' }, { ...valid, email: 'bad@' }, { ...valid, projectType: 'other' }, { ...valid, message: {} }, { ...valid, message: 'a'.repeat(6001) }, { ...valid, website: 'https://spam.test' }]) {
    const response = await worker.fetch(request(body), env);
    assert.equal(response.status, 400);
  }
  assert.equal(sent.length, 0);
});

test('rejects untrusted or missing origins and allows only expected preflight headers', async () => {
  const { env, sent } = setup();
  for (const origin of ['https://evil.test', 'null', '']) {
    const response = await worker.fetch(new Request('https://contact.test/api/contact', { method: 'POST', headers: { Origin: origin } }), env);
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  }
  const preflight = await worker.fetch(new Request('https://contact.test/api/contact', { method: 'OPTIONS', headers: { Origin: 'https://typeworks.pro' } }), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
  assert.equal(sent.length, 0);
});

test('rejects malformed JSON and unsupported content types or methods', async () => {
  const { env } = setup();
  assert.equal((await worker.fetch(request('{'), env)).status, 400);
  assert.equal((await worker.fetch(new Request('https://contact.test/api/contact', { method: 'POST', headers: { Origin: 'https://typeworks.pro', 'Content-Type': 'text/plain' }, body: '{}' }), env)).status, 415);
  assert.equal((await worker.fetch(new Request('https://contact.test/api/contact', { headers: { Origin: 'https://typeworks.pro' } }), env)).status, 405);
});

test('bounds streamed body even when Content-Length is absent or incorrect', async () => {
  const { env, sent } = setup();
  const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(20000)); controller.enqueue(new Uint8Array(20000)); controller.close(); } });
  const response = await worker.fetch(new Request('https://contact.test/api/contact', { method: 'POST', headers: { Origin: 'https://typeworks.pro', 'Content-Type': 'application/json', 'Content-Length': '1' }, body, duplex: 'half' }), env);
  assert.equal(response.status, 413);
  assert.equal(sent.length, 0);
});

test('throttled submission returns retry guidance without sending', async () => {
  const { env, sent } = setup();
  env.CONTACT_RATE_LIMITER.limit = async () => ({ success: false });
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(sent.length, 0);
});

test('provider failure never reports success or leaks its details', async () => {
  const { env } = setup();
  env.EMAIL.send = async () => { throw new Error('private upstream error'); };
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false, code: 'send_failed' });
});

test('missing bindings or trusted edge IP fails closed', async () => {
  const { env, sent } = setup();
  assert.equal((await worker.fetch(request(), {})).status, 503);
  const req = request(); req.headers.delete('CF-Connecting-IP');
  assert.equal((await worker.fetch(req, env)).status, 503);
  assert.equal(sent.length, 0);
});

test('rate limits use each trusted edge IP independently and fail safely on limiter errors', async () => {
  const { env, sent } = setup();
  const keys = [];
  env.CONTACT_RATE_LIMITER.limit = async ({ key }) => { keys.push(key); return { success: true }; };
  await worker.fetch(request(), env);
  const another = request(); another.headers.set('CF-Connecting-IP', '192.0.2.2');
  await worker.fetch(another, env);
  assert.deepEqual(keys, ['192.0.2.1', '192.0.2.2']);
  env.CONTACT_RATE_LIMITER.limit = async () => { throw new Error('private limiter failure'); };
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false, code: 'send_failed' });
  assert.equal(sent.length, 2);
});

test('four-step inquiry includes phone, chosen work, notes and multiline schedule', async () => {
  const {env,sent} = setup();
  const response = await worker.fetch(request({...valid,schemaVersion:2,locale:'en',phone:'+44 20 1234 5678',references:['knet','melissa'],referenceUnknown:false,referenceNotes:'Screen layout\n<script>unsafe</script>',timeline:'Start in November\nAbout two months'}),env);
  assert.equal(response.status,200);
  assert.match(sent[0].text,/\+44 20 1234 5678/);
  assert.match(sent[0].text,/K-NET, Melissa/);
  assert.match(sent[0].text,/Start in November\nAbout two months/);
  assert.match(sent[0].html,/&lt;script&gt;/);
  assert.doesNotMatch(sent[0].html,/<script>/);
});

test('new inquiry validates reference choices and optional field bounds before sending', async () => {
  const {env,sent} = setup();
  const modern = {...valid,schemaVersion:2,referenceUnknown:true,references:[]};
  for (const patch of [{references:['missing']},{references:'knet'},{references:['knet'],referenceUnknown:true},{referenceUnknown:'yes'},{referenceUnknown:false},{phone:'x'.repeat(41)},{referenceNotes:'x'.repeat(2001)},{timeline:'x'.repeat(1001)},{locale:'fr'},{phone:'010\r\nBcc: x'},{schemaVersion:4}]) {
    assert.equal((await worker.fetch(request({...modern,...patch}),env)).status,400,JSON.stringify(patch).slice(0,80));
  }
  assert.equal(sent.length,0);
  assert.equal((await worker.fetch(request({...modern,phone:'',budget:'',timeline:''}),env)).status,200);
  assert.equal((await worker.fetch(request({...modern,referenceUnknown:false,referenceNotes:'Written notes only'}),env)).status,200);
});
