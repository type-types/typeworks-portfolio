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
  const headerEvents = new EventTarget();
  const root = {classList:classes(),dataset:{focusInput:'pointer'},scrollHeight:2400};
  const header = {classList:classes(),offsetHeight:80,contains:element=>element?.insideHeader === true,addEventListener:headerEvents.addEventListener.bind(headerEvents)};
  const document = {documentElement:root,activeElement:{matches:()=>false},querySelector:selector=>selector === '.site-header' ? header : {},addEventListener:docEvents.addEventListener.bind(docEvents)};
  const window = {scrollY:0,innerHeight:800,addEventListener:winEvents.addEventListener.bind(winEvents)};
  const frames = [];
  vm.runInNewContext(source,{document,window,requestAnimationFrame:callback=>{frames.push(callback);return frames.length;}});
  const emit = (target,type,properties={}) => {
    const event = new Event(type);
    for (const [key,value] of Object.entries(properties)) Object.defineProperty(event,key,{value});
    target.dispatchEvent(event);
  };
  const queueScroll = y => {window.scrollY=y;emit(winEvents,'scroll');};
  const flush = () => {while(frames.length)frames.shift()();};
  return {
    root,header,document,queueScroll,flush,
    scroll(y){queueScroll(y);flush();},
    focus(input){
      root.dataset.focusInput = input;
      document.activeElement = {insideHeader:true,matches:()=>false};
      emit(docEvents,'focusin',{target:document.activeElement});
    },
    pointerdown(){emit(headerEvents,'pointerdown');},
    release(type='pointerup'){emit(type === 'blur' ? winEvents : docEvents,type);},
  };
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

test('pointer focus preserves a hidden header while keyboard focus reveals it', () => {
  const app = setup();
  app.scroll(200);
  app.focus('pointer');
  assert.ok(app.header.classList.contains('is-scroll-hidden'));
  app.focus('keyboard');
  assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
});

test('pressing the header consumes queued scroll and release establishes a new scroll baseline', () => {
  const app = setup();
  app.scroll(200);
  app.scroll(180);
  app.queueScroll(220);
  app.pointerdown();
  assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
  app.flush();
  assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
  app.queueScroll(260);
  app.release();
  app.flush();
  assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
  app.scroll(280);
  assert.ok(app.header.classList.contains('is-scroll-hidden'));
});

for (const release of ['pointercancel','blur']) {
  test(`holding the header suspends hiding until ${release} releases it`, () => {
    const app = setup();
    app.scroll(180);
    app.scroll(160);
    app.pointerdown();
    app.scroll(210);
    app.scroll(250);
    assert.equal(app.header.classList.contains('is-scroll-hidden'),false);
    app.release(release);
    app.scroll(270);
    assert.ok(app.header.classList.contains('is-scroll-hidden'));
  });
}
