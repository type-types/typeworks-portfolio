import test from 'node:test';
import assert from 'node:assert/strict';
import {contactBody} from './render.mjs';
import {contactLocales} from '../../content/contact-locales/index.mjs';
import {contactLimits} from '../../content/contact-contract.mjs';

test('both languages render the same four steps and input structure', () => {
  const pages=Object.values(contactLocales).map(contactBody);
  const structure=html=>[...html.matchAll(/(?:data-panel|name)="([^"]+)"/g)].map(match=>match[0]);
  assert.deepEqual(structure(pages[0]),structure(pages[1]));
  for(const html of pages) {
    assert.deepEqual([...html.matchAll(/data-panel="(\d)"/g)].map(match=>match[1]),['0','1','2','3']);
    assert.doesNotMatch(html,/세 단계|intake-outcome|로컬 시안|placeholder=/);
    assert.ok(html.indexOf('id="intake-referenceNotes"')<html.indexOf('class="reference-grid"'));
    assert.match(html,/action="https:\/\/typeworks-contact/);
    for(const name of ['name','email','phone','referenceNotes','timeline','message','budget']) {
      assert.match(html,new RegExp(`name="${name}"[^>]*maxlength="${contactLimits[name]}"`));
    }
  }
});
