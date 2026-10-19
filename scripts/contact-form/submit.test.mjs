import test from 'node:test';
import assert from 'node:assert/strict';
import {sendInquiry,inquiryPayload} from './submit.mjs';

test('sends only an explicit inquiry and requires the server to acknowledge acceptance', async () => {
  let recorded;
  await sendInquiry('https://contact.test/api/contact',{schemaVersion:2},{fetchImpl:async (url,options)=>{recorded={url,options};return new Response('{"ok":true}',{status:200});}});
  assert.equal(recorded.options.method,'POST');
  assert.equal(recorded.options.credentials,'omit');
  assert.equal(JSON.parse(recorded.options.body).schemaVersion,2);
  for (const response of [new Response('{"ok":false}',{status:200}),new Response('{"ok":true}',{status:500}),new Response('<html>error</html>',{status:502})]) {
    await assert.rejects(sendInquiry('https://contact.test',{}, {fetchImpl:async()=>response}),/send_failed/);
  }
  await assert.rejects(sendInquiry('https://contact.test',{}, {fetchImpl:async()=>new Response('{}',{status:429})}),/rate_limit/);
});

test('keeps network and abort failures available to the form retry flow', async () => {
  await assert.rejects(sendInquiry('https://contact.test',{}, {fetchImpl:async()=>{throw new Error('network');}}),/network/);
  const signal = AbortSignal.abort();
  await assert.rejects(sendInquiry('https://contact.test',{}, {signal,fetchImpl:async (_,{signal})=>{signal.throwIfAborted();}}),{name:'AbortError'});
});

test('payload carries every new field and stable case identifiers', () => {
  const values={name:' A ',company:' B ',email:'a@example.com',phone:'010-1234-5678',budget:'',timeline:'two lines\nnext',referenceNotes:'notes',message:'project',website:''};
  const form={elements:{...Object.fromEntries(Object.entries(values).map(([name,value])=>[name,{value}])),referenceUnknown:{checked:false}},querySelectorAll:()=>[{value:'knet'},{value:'melissa'}]};
  const payload=inquiryPayload(form,'en');
  assert.equal(payload.name,'A');
  assert.equal(payload.locale,'en');
  assert.equal(payload.phone,values.phone);
  assert.equal(payload.timeline,values.timeline);
  assert.deepEqual(payload.references,['knet','melissa']);
});
