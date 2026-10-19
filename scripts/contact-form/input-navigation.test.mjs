import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceTextInput} from './input-navigation.mjs';

test('Enter advances through short fields without advancing a whole step', () => {
  let selected = null;
  let finished = 0;
  let prevented = 0;
  const inputs = ['name','email','phone'].map(name => ({name,matches:()=>true,focus(){selected = name;}}));
  for (let index = 0; index < inputs.length; index += 1) {
    advanceTextInput({key:'Enter',target:inputs[index],preventDefault(){prevented += 1;}},inputs,() => {finished += 1;});
    assert.equal(finished,index === 2 ? 1 : 0);
    if (index < 2) assert.equal(selected,inputs[index + 1].name);
  }
  assert.equal(prevented,3);
});

test('textareas, checkboxes, IME confirmation and other keys retain their native action', () => {
  const target = {matches:()=>true};
  const fail = () => assert.fail('Native keyboard action must remain available');
  for (const patch of [{isComposing:true},{keyCode:229},{key:'Tab'},{target:{matches:()=>false}}]) {
    advanceTextInput({key:'Enter',target,preventDefault:fail,...patch},[target],fail);
  }
});
