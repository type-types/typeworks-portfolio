import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDraft, loadDraft, saveDraft } from './draft-store.mjs';

const sample = {version:1, values:{name:'테스트', phone:'010-0000-0000', referenceNotes:'두 줄\n설명'}, references:['melissa','ondam'], unknown:false, expanded:true, step:2, visited:2};

test('restores complete text, selections, expansion and stage', () => {
  const draft = parseDraft(JSON.stringify(sample), ['melissa','ondam']);
  assert.equal(draft.values.referenceNotes, '두 줄\n설명');
  assert.equal(draft.values.phone, sample.values.phone);
  assert.deepEqual(draft.references, sample.references);
  assert.equal(draft.step, 2);
  assert.equal(draft.expanded, true);
});

test('ignores unknown fields and references and limits saved field lengths', () => {
  const draft = parseDraft(JSON.stringify({...sample, values:{name:'x'.repeat(100), email:17, other:'ignored'}, references:['melissa','removed','melissa'], step:100, visited:-5}), ['melissa']);
  assert.equal(draft.values.name.length, 80);
  assert.equal(draft.values.email, '');
  assert.equal(draft.values.other, undefined);
  assert.deepEqual(draft.references, ['melissa']);
  assert.equal(draft.step, 3);
  assert.equal(draft.visited, 0);
});

test('restores undecided exclusively and tolerates invalid or old drafts', () => {
  assert.deepEqual(parseDraft(JSON.stringify({...sample, unknown:true}), ['melissa']).references, []);
  for (const raw of ['{broken', 'null', '[]', '{"version":99,"values":{}}', '{"version":1,"values":[]}']) assert.equal(parseDraft(raw, []), null);
});

test('storage round trip and access failures stay contained', () => {
  const original = globalThis.window;
  try {
    const items = new Map();
    globalThis.window = {localStorage:{getItem:key=>items.get(key) ?? null, setItem:(key,value)=>items.set(key,value)}};
    assert.equal(saveDraft('test-draft', sample), true);
    assert.equal(loadDraft('test-draft', ['melissa','ondam']).draft.values.name, '테스트');
    items.set('bad-draft', '{broken');
    assert.deepEqual(loadDraft('bad-draft', []), {draft:null, available:true});
    globalThis.window = {get localStorage(){throw new Error('Storage disabled');}};
    assert.equal(saveDraft('test-draft', sample), false);
    assert.deepEqual(loadDraft('test-draft', []), {draft:null, available:false});
    globalThis.window = {localStorage:{setItem(){throw new Error('Quota exceeded');}}};
    assert.equal(saveDraft('test-draft', sample), false);
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
});

test('merges the three earlier schedule inputs into one editable text value', () => {
  const old = parseDraft(JSON.stringify({...sample, values:{timeline:'12월까지 완료'}}), []);
  assert.equal(old.values.timeline, '12월까지 완료');
  const draft = parseDraft(JSON.stringify({...sample, version:2, values:{timeline:'협의 가능', startTiming:'11월 중', projectDuration:'약 2개월', targetCompletion:'1월 말까지'}}), []);
  assert.equal(draft.values.timeline, '협의 가능\n착수 희망 시점: 11월 중\n희망 제작 기간: 약 2개월\n완료 희망 시점: 1월 말까지');
  assert.equal(parseDraft(JSON.stringify(draft), []).values.timeline, draft.values.timeline);
  assert.equal(draft.values.startTiming, undefined);
});

test('migrates an earlier draft without letting an older tab overwrite new schedule fields', () => {
  const original = globalThis.window;
  const items = new Map([['old', JSON.stringify(sample)]]);
  try {
    globalThis.window = {localStorage:{getItem:key=>items.get(key) ?? null, setItem:(key,value)=>items.set(key,value)}};
    const migrated = loadDraft('new', ['melissa','ondam'], 'old').draft;
    assert.equal(migrated.version, 4);
    assert.equal(migrated.values.phone, sample.values.phone);
    migrated.values.timeline = '11월 중 시작, 약 2개월';
    saveDraft('new', migrated);
    items.set('old', JSON.stringify({...sample, values:{name:'old tab edit'}}));
    assert.equal(loadDraft('new', ['melissa','ondam'], ['previous', 'old']).draft.values.timeline, '11월 중 시작, 약 2개월');
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
});

test('preserves review stage and international number across languages', () => {
  const draft = parseDraft(JSON.stringify({...sample, version:4, step:3, visited:3, phoneRegion:'international', values:{phone:'+44 20 1234 5678'}}), []);
  assert.equal(draft.step, 3);
  assert.equal(draft.visited, 3);
  assert.equal(draft.phoneRegion, 'international');
  assert.equal(draft.values.phone, '+44 20 1234 5678');
  assert.equal(parseDraft(JSON.stringify(sample), []).phoneRegion, 'KR');
});
