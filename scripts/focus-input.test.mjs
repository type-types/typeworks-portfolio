import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const setup = () => {
  const initializer = source.match(/  const initializeFocusIndicators = \(\) => \{[\s\S]*?\n  \};/);
  assert.ok(initializer, 'Track input intent before script moves menu focus');
  const events = new EventTarget();
  const root = { dataset: {} };
  vm.runInNewContext(`${initializer[0]}\ninitializeFocusIndicators();`, {
    document: { documentElement: root, addEventListener: events.addEventListener.bind(events) },
  });
  const dispatch = (type, values = {}) => {
    const event = new Event(type);
    Object.assign(event, values);
    events.dispatchEvent(event);
  };
  return { root, dispatch };
};

test('keeps native focus behavior before the user interacts', () => {
  const { root } = setup();
  assert.equal(root.dataset.focusInput, undefined);
});

test('touch, mouse and pen interactions clear a previous keyboard indication', () => {
  const { root, dispatch } = setup();
  for (const pointerType of ['touch', 'mouse', 'pen']) {
    dispatch('keydown', { key: 'Tab' });
    assert.equal(root.dataset.focusInput, 'keyboard');
    dispatch('pointerdown', { pointerType });
    assert.equal(root.dataset.focusInput, 'pointer');
  }
});

test('keyboard navigation resumes after touch while modifier keys retain input intent', () => {
  const { root, dispatch } = setup();
  dispatch('pointerdown', { pointerType: 'touch' });
  for (const key of ['Shift', 'Control', 'Alt', 'Meta']) dispatch('keydown', { key });
  dispatch('keydown', { key: 'l', metaKey: true });
  assert.equal(root.dataset.focusInput, 'pointer');
  for (const key of ['Tab', 'Enter', 'Escape', 'ArrowDown']) {
    dispatch('keydown', { key });
    assert.equal(root.dataset.focusInput, 'keyboard');
    dispatch('pointerdown', { pointerType: 'touch' });
  }
});
