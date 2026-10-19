import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./header-scroll.mjs',import.meta.url),'utf8');
const classes = () => {
  const values = new Set();
  return {add:value=>values.add(value),remove:value=>values.delete(value),contains:value=>values.has(value)};
};
const setup = () => {
  const docEvents = new EventTarget();
  const winEvents = new EventTarget();
  const root = {classList:classes(),dataset:{focusInput:'pointer'},scrollHeight:2400};
  const header = {classList:classes(),offsetHeight:80,contains:element=>element?.insideHeader === true};
  const document = {documentElement:root,activeElement:{matches:()=>false},querySelector:selector=>selector === '.site-header' ? header : {},addEventListener:docEvents.addEventListener.bind(docEvents)};
  const window = {scrollY:0,innerHeight:800,addEventListener:winEvents.addEventListener.bind(winEvents)};
  const frames = [];
  vm.runInNewContext(source,{document,window,requestAnimationFrame:callback=>{frames.push(callback);return frames.length;}});
  return {root,header,document,scroll(y){window.scrollY=y;winEvents.dispatchEvent(new Event('scroll'));while(frames.length)frames.shift()();}};
};

test('hides on downward travel, ignores small reversals and reveals on upward travel', () => {
  const app = setup();
  app.scroll(200);
  assert.ok(app.header.classList.contains('is-scroll-hidden'));
  app.scroll(196);
  assert.ok(app.header.classList.contains('is-scroll-hidden'));
  app.scroll(185);
  assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
  app.scroll(190);
  app.scroll(187);
  assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
});

test('a pointer-focused menu button does not prevent later hiding, while keyboard navigation does', () => {
  const app = setup();
  app.document.activeElement = {insideHeader:true,matches:()=>false};
  app.scroll(200);
  assert.ok(app.header.classList.contains('is-scroll-hidden'));
  app.scroll(150);
  app.root.dataset.focusInput = 'keyboard';
  app.scroll(250);
  assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
});

test('editing and an open overlay keep the header stable', () => {
  for (const overlay of ['menu-open','quick-contact-open']) {
    const app = setup();
    app.root.classList.add(overlay);
    app.scroll(200);
    assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
  }
  const app = setup();
  app.document.activeElement = {matches:()=>true};
  app.scroll(200);
  assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
});
