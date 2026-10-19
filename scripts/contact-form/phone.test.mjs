import test from 'node:test';
import assert from 'node:assert/strict';
import {formatPhone, formatPhoneInput} from './phone.mjs';

test('formats Korean mobile and landline numbers without truncation', () => {
  for (const [input, expected] of [['01012345678','010-1234-5678'],['010-1234-5678','010-1234-5678'],['0212345678','02-1234-5678'],['021234567','02-123-4567'],['0311234567','031-123-4567'],['03112345678','031-1234-5678'],['','']]) assert.equal(formatPhone(input),expected);
  assert.equal(formatPhone('010123456789'), '010123456789');
});
test('preserves international numbers in either format mode', () => {
  assert.equal(formatPhone('+82 10 1234 5678'), '+82 10 1234 5678');
  assert.equal(formatPhone('020 1234 5678', 'international'), '020 1234 5678');
  assert.equal(formatPhone('+44 (0)20 1234 5678', 'international'), '+44 (0)20 1234 5678');
});
test('keeps the cursor at the same digit while formatting in the middle', () => {
  const input = {value:'01012345678', selectionStart:6, selectionEnd:6, setSelectionRange(start,end){this.selectionStart=start;this.selectionEnd=end;}};
  formatPhoneInput(input,'KR');
  assert.equal(input.value,'010-1234-5678');
  assert.equal(input.selectionStart,7);
});
