import {parseDraft, loadDraft, saveDraft, draftKey, legacyDraftKeys} from './draft-store.mjs';
import {formatPhoneInput} from './phone.mjs';
import {sendInquiry} from './submit.mjs';
import {advanceTextInput} from './input-navigation.mjs';

const dialog = document.querySelector('#quick-contact');
const launcher = document.querySelector('#quick-launcher');
const form = document.querySelector('#quick-form');
const t = JSON.parse(document.querySelector('#quick-messages').textContent);
const names = ['name','email','phone','message'];
const inputs = names.map(name => form.elements[name]);
const status = form.querySelector('.quick-status');
const storage = form.querySelector('.quick-storage');
const send = form.querySelector('.quick-send');
const sendLabel = send.querySelector('.quick-send-label');
const complete = dialog.querySelector('.quick-complete');
const initial = loadDraft(draftKey,t.referenceIds,legacyDraftKeys);
let storageAvailable = initial.available;
let draft = initial.draft || parseDraft(JSON.stringify({version:5,values:{},phoneRegion:t.lang === 'ko' ? 'KR' : 'international'}),t.referenceIds);
let sending = false;
let controller;
let resumeInput;
const launcherHome = document.createComment('quick-launcher');
launcher.before(launcherHome);
const launcherParts = [
  [launcher,['width','paddingLeft','paddingRight']],
  ...['label','message','cross'].map(part => [launcher.querySelector(`.quick-launcher-${part}`),['opacity','transform']]),
];
let launcherAnimations = [];
const morphLauncher = (open,{animate = true} = {}) => {
  const from = launcherParts.map(([element,properties]) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(properties.map(property => [property,style[property]]));
  });
  for (const animation of launcherAnimations) animation.cancel();
  // Keep the same control in the modal's top layer while its right edge stays fixed.
  if (open) dialog.append(launcher);
  else launcherHome.after(launcher);
  launcher.classList.toggle('is-open',open);
  launcher.setAttribute('aria-expanded',String(open));
  launcher.setAttribute('aria-label',open ? t.quick.close : t.quick.open);
  launcherAnimations = [];
  if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  launcherAnimations = launcherParts.map(([element,properties],index) => {
    const style = getComputedStyle(element);
    const to = Object.fromEntries(properties.map(property => [property,style[property]]));
    return element.animate([from[index],to],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});
  });
};

const fill = next => {
  draft = next;
  for (const name of names) if (form.elements[name].value !== draft.values[name]) form.elements[name].value = draft.values[name];
};
fill(draft);
const reportStorageFailure = unavailable => {
  storage.textContent = unavailable ? t.errors.storage : '';
  storage.hidden = !unavailable;
};
reportStorageFailure(!initial.available);

const persist = () => {
  const latest = storageAvailable ? loadDraft(draftKey,t.referenceIds,legacyDraftKeys).draft : null;
  draft = {...(latest || draft), phoneRegion:draft.phoneRegion, values:{...(latest || draft).values,...Object.fromEntries(inputs.map(input => [input.name,input.value]))}};
  const saved = saveDraft(draftKey,draft);
  storageAvailable = saved;
  reportStorageFailure(!saved);
  window.dispatchEvent(new CustomEvent('typeworks:contact-draft',{detail:{source:'quick',draft}}));
  return saved;
};
const showError = (input,text) => {
  const message = form.querySelector(`#quick-error-${input.name}`);
  message.hidden = !text;
  message.textContent = text;
  if (text) input.setAttribute('aria-invalid','true');
  else input.removeAttribute('aria-invalid');
};
const errorFor = input => {
  if (input.required && !input.value.trim()) return t.errors[input.name];
  if (input.name === 'email' && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(input.value.trim())) return t.errors.emailInvalid;
  return '';
};
const fitViewport = () => {
  const viewport = window.visualViewport;
  if (!viewport) return;
  dialog.classList.toggle('is-compact',viewport.height < 500);
  dialog.style.setProperty('--quick-viewport-height',`${viewport.height}px`);
  const inset = `${Math.max(0,window.innerHeight - viewport.height - viewport.offsetTop)}px`;
  dialog.style.setProperty('--quick-keyboard-inset',inset);
  launcher.style.setProperty('--quick-keyboard-inset',inset);
};
const close = ({restoreFocus = true,animate = true} = {}) => {
  if (!dialog.open) return;
  persist();
  morphLauncher(false,{animate});
  document.documentElement.classList.remove('quick-contact-open');
  dialog.close();
  if (restoreFocus) launcher.focus({preventScroll:true});
};
dialog.querySelector('.quick-close').addEventListener('click',close);
dialog.addEventListener('cancel',event => { event.preventDefault(); close(); });
let outsideStart = false;
const isOutside = event => {
  const box = dialog.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
};
dialog.addEventListener('pointerdown',event => { outsideStart = event.target === dialog && isOutside(event); });
dialog.addEventListener('pointerup',event => { if (outsideStart && event.target === dialog && isOutside(event)) close(); outsideStart = false; });
dialog.addEventListener('close',() => {
  if (dialog.open || !launcher.classList.contains('is-open')) return;
  document.documentElement.classList.remove('quick-contact-open');
  morphLauncher(false,{animate:false});
});
launcher.addEventListener('click',() => {
  if (dialog.open) { close(); return; }
  const latest = storageAvailable ? loadDraft(draftKey,t.referenceIds,legacyDraftKeys).draft : null;
  if (latest) fill(latest);
  document.documentElement.classList.add('quick-contact-open');
  fitViewport();
  dialog.showModal();
  morphLauncher(true);
  if (form.hidden) complete.querySelector('h3').focus({preventScroll:true});
  else if (sending) dialog.querySelector('h2').focus({preventScroll:true});
  else (resumeInput || inputs.find(input => input.required && !input.value.trim()) || inputs[0]).focus();
});
form.addEventListener('focusin',event => { if (inputs.includes(event.target)) resumeInput = event.target; });
form.addEventListener('keydown',event => advanceTextInput(event,inputs,() => {}));
const onInput = event => {
  if (event.target.name === 'phone' && !event.isComposing) {
    if (event.target.value.trim().startsWith('+')) draft.phoneRegion = 'international';
    formatPhoneInput(event.target,draft.phoneRegion);
  }
  if (!inputs.includes(event.target)) return;
  if (event.target.hasAttribute('aria-invalid')) showError(event.target,errorFor(event.target));
  status.textContent = '';
  status.classList.remove('is-error');
  persist();
};
form.addEventListener('input',onInput);
form.addEventListener('change',onInput);
form.querySelector('.quick-detailed').addEventListener('click',event => {
  if (sending) { event.preventDefault(); return; }
  const saved = persist();
  if (document.querySelector('#three-step-form')) {
    event.preventDefault();
    close({restoreFocus:false});
    window.dispatchEvent(new CustomEvent('typeworks:open-detailed'));
  } else if (!saved) {
    event.preventDefault();
    status.textContent = t.errors.storage;
    status.classList.add('is-error');
  }
});
form.addEventListener('submit',async event => {
  event.preventDefault();
  if (sending) return;
  let first = null;
  for (const input of inputs) {
    const error = errorFor(input);
    showError(input,error);
    if (error && !first) first = input;
  }
  if (first) { first.focus(); return; }
  persist();
  sending = true;
  form.querySelector('fieldset').disabled = true;
  form.setAttribute('aria-busy','true');
  sendLabel.textContent = t.quick.sending;
  status.classList.remove('is-error');
  status.textContent = t.errors.sending;
  controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(),25000);
  try {
    await sendInquiry(form.action,{schemaVersion:3,mode:'quick',locale:t.lang,company:'',...Object.fromEntries(inputs.map(input => [input.name,input.value.trim()])),projectType:'상담 후 결정',budget:'',timeline:'',referenceNotes:'',references:[],referenceUnknown:false,website:form.elements.website.value},{signal:controller.signal});
    form.hidden = true;
    complete.hidden = false;
    if (dialog.open) complete.querySelector('h3').focus();
  } catch (error) {
    status.classList.add('is-error');
    status.textContent = error.message === 'rate_limit' ? t.errors.rateLimit : t.errors.send;
  } finally {
    window.clearTimeout(timeout);
    sending = false;
    controller = null;
    form.querySelector('fieldset').disabled = false;
    form.removeAttribute('aria-busy');
    sendLabel.textContent = form.hidden ? t.quick.send : t.quick.retry;
    if (dialog.open && !form.hidden) {
      status.scrollIntoView({behavior:'instant',block:'nearest'});
      send.focus({preventScroll:true});
    }
  }
});
dialog.querySelector('.quick-edit').addEventListener('click',() => {
  complete.hidden = true;
  form.hidden = false;
  status.textContent = '';
  sendLabel.textContent = t.quick.send;
  inputs[0].focus();
});
window.addEventListener('typeworks:contact-draft',event => {
  if (event.detail.source !== 'detail' || sending) return;
  storageAvailable = event.detail.available;
  fill(event.detail.draft);
  reportStorageFailure(!storageAvailable);
});
window.visualViewport?.addEventListener('resize',fitViewport);
window.visualViewport?.addEventListener('scroll',fitViewport);
window.addEventListener('pagehide',() => { controller?.abort(); close({restoreFocus:false,animate:false}); });
launcher.hidden = false;
