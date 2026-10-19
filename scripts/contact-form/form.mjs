import { draftFields, loadDraft, saveDraft } from './draft-store.mjs';
import { formatPhoneInput } from './phone.mjs';
import {inquiryPayload, sendInquiry} from './submit.mjs';
const t = JSON.parse(document.querySelector('#intake-messages').textContent);

const form = document.querySelector('#three-step-form');

if (form) {
  const fields = form.querySelector('.intake-fields');
  const panels = [...form.querySelectorAll('[data-panel]')];
  const steps = [...form.querySelectorAll('[data-intake-step]')];
  const back = form.querySelector('.intake-back');
  const nextLabel = form.querySelector('.intake-next-label');
  const status = form.querySelector('.intake-status');
  const complete = document.querySelector('.intake-complete');
  const references = [...form.querySelectorAll('[name="references"]')];
  const unknown = form.elements.referenceUnknown;
  const extraReferences = form.querySelector('#extra-references');
  const showMore = form.querySelector('.show-more-references');
  const draftStatus = form.querySelector('.intake-draft-status');
  const draftKey = form.dataset.draftKey;
  const requiredByStep = [['name', 'company', 'email'], ['references'], ['message'], []];
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  let current = 0;
  let visited = 0;
  let editing = false;
  let sending = false;
  let sent = false;
  let controller;

  const chosenReferences = () => references.filter(input => input.checked);
  const caseName = input => input.closest('label').querySelector('.reference-title').textContent;
  const caseSummary = () => unknown.checked ? t.reference.summaryUnknown : chosenReferences().map(caseName).join(', ');
  const errorFor = name => {
    if (name === 'references') return chosenReferences().length || unknown.checked || form.elements.referenceNotes.value.trim() ? '' : t.errors.references;
    const input = form.elements[name];
    if (!input.value.trim()) return t.errors[name];
    if (name === 'email' && !emailPattern.test(input.value.trim())) return t.errors.emailInvalid;
    return '';
  };
  const showError = (name, message) => {
    const error = document.querySelector(`#error-${name}`);
    error.textContent = message;
    error.hidden = !message;
    const inputs = name === 'references' ? [...references, unknown, form.elements.referenceNotes] : [form.elements[name]];
    for (const input of inputs) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      const ids = new Set((input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
      if (message) ids.add(error.id);
      else ids.delete(error.id);
      if (ids.size) input.setAttribute('aria-describedby', [...ids].join(' '));
      else input.removeAttribute('aria-describedby');
    }
  };
  const validate = step => {
    let first = null;
    for (const name of requiredByStep[step]) {
      const error = errorFor(name);
      showError(name, error);
      if (error && !first) first = name === 'references' ? form.elements.referenceNotes : form.elements[name];
    }
    return first;
  };
  const updateReview = () => {
    for (const name of ['name','company','email','phone','budget','timeline','message']) form.querySelector(`[data-review="${name}"]`).textContent = form.elements[name].value.trim() || t.review.empty;
    form.querySelector('.review-cases').textContent = caseSummary() || t.reference.summaryNotes;
    const notes = form.querySelector('.review-reference-notes');
    notes.hidden = !form.elements.referenceNotes.value.trim();
    notes.querySelector('.review-note-copy').textContent = form.elements.referenceNotes.value.trim();
  };
  const reportStorageFailure = unavailable => {
    const text = unavailable ? t.errors.storage : '';
    if (draftStatus.textContent !== text) draftStatus.textContent = text;
    draftStatus.hidden = !unavailable;
  };
  const persist = () => {
    const draft = {
      version:4,
      phoneRegion:form.elements.phoneRegion.value,
      values:Object.fromEntries(draftFields.map(name => [name, form.elements[name].value])),
      references:chosenReferences().map(input => input.value),
      unknown:unknown.checked,
      expanded:!extraReferences.hidden,
      step:current,
      editing,
      visited,
    };
    const saved = saveDraft(draftKey, draft);
    reportStorageFailure(!saved);
    return saved;
  };
  const expandReferences = ({focus = false, animate = false} = {}) => {
    extraReferences.hidden = false;
    showMore.hidden = true;
    if (animate) extraReferences.classList.add('is-entering');
    if (focus) extraReferences.querySelector('input').focus({preventScroll:true});
  };
  showMore.addEventListener('click', () => {
    expandReferences({focus:true, animate:true});
    persist();
  });
  const render = ({focus = true} = {}) => {
    panels.forEach((panel, index) => {
      panel.hidden = index !== current;
      panel.classList.toggle('is-entering', index === current);
    });
    steps.forEach((button, index) => {
      button.disabled = index > visited;
      button.classList.toggle('is-complete', index < current);
      if (index === current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    back.hidden = current === 0;
    nextLabel.textContent = current === 3 ? t.actions.send : editing ? t.actions.return : current === 2 ? t.actions.review : t.actions.next;
    updateReview();
    if (sent) {
      panels[3].querySelector('h2').textContent = t.complete.title;
      panels[3].querySelector('.intake-heading p').textContent = t.complete.description;
      form.querySelector('.intake-next').hidden = true;
      back.hidden = true;
      steps.forEach(button => {button.disabled = true;});
      form.querySelectorAll('[data-edit-step]').forEach(button => {button.hidden = true;});
      form.querySelectorAll('input,textarea,select').forEach(input => {input.disabled = true;});
    }
    if (focus) panels[current].querySelector('h2').focus();
  };
  const move = index => {
    if (sending || index === current) return;
    status.textContent = '';
    status.classList.remove('is-error');
    current = index;
    visited = Math.max(visited, current);
    render();
    persist();
  };
  const moveForward = target => {
    for (let index = 0; index < target; index += 1) {
      const invalid = validate(index);
      if (invalid) {
        move(index);
        invalid.focus();
        return;
      }
    }
    move(target);
  };

  back.addEventListener('click', () => {
    editing = false;
    move(current - 1);
  });
  steps.forEach((button, index) => button.addEventListener('click', () => {
    if (index === current) return;
    editing = false;
    if (index > current) moveForward(index);
    else move(index);
  }));
  form.querySelectorAll('[data-edit-step]').forEach(button => button.addEventListener('click', () => {
    editing = true;
    move(Number(button.dataset.editStep));
  }));
  form.elements.phone.addEventListener('beforeinput', event => {
    const input = event.target;
    const position = input.selectionStart;
    if (form.elements.phoneRegion.value === 'KR' && event.inputType === 'deleteContentBackward' && position === input.selectionEnd && input.value[position - 1] === '-') {
      input.setSelectionRange(position - 1, position - 1);
    }
  });
  form.addEventListener('input', event => {
    const name = event.target.name;
    if (name === 'phone' && !event.isComposing) formatPhoneInput(event.target, form.elements.phoneRegion.value);
    if (name === 'referenceNotes' && references[0].hasAttribute('aria-invalid')) showError('references', errorFor('references'));
    if (['name','company','email','message'].includes(name) && event.target.hasAttribute('aria-invalid')) showError(name, errorFor(name));
    status.textContent = '';
    status.classList.remove('is-error');
    if (draftFields.includes(name)) persist();
  });
  form.addEventListener('change', event => {
    if (event.target.name === 'phoneRegion') {
      syncPhoneRegion();
      persist();
    }
    if (event.target === unknown && unknown.checked) references.forEach(input => { input.checked = false; });
    else if (references.includes(event.target) && event.target.checked) unknown.checked = false;
    if (event.target === unknown || references.includes(event.target)) {
      if (references[0].hasAttribute('aria-invalid')) showError('references', errorFor('references'));
      persist();
    } else if (draftFields.includes(event.target.name)) persist();
  });
  form.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Enter' && event.target.matches('input')) {
      event.preventDefault();
      if (current < 3) form.requestSubmit();
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || sent) return;
    if (current < 3) {
      const invalid = validate(current);
      if (invalid) return invalid.focus();
      const target = editing ? 3 : current + 1;
      editing = false;
      moveForward(target);
      return;
    }
    for (let index = 0; index < panels.length; index += 1) {
      const invalid = validate(index);
      if (invalid) {
        move(index);
        invalid.focus();
        return;
      }
    }
    persist();
    sending = true;
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    nextLabel.textContent = t.actions.sending;
    status.classList.remove('is-error');
    status.textContent = t.errors.sending;
    controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25000);
    let failure = null;
    try {
      await sendInquiry(form.action, inquiryPayload(form,t.lang), {signal:controller.signal});
      sent = true;
    } catch (error) {
      failure = error;
    } finally {
      window.clearTimeout(timeout);
      sending = false;
      controller = null;
      fields.disabled = false;
      form.removeAttribute('aria-busy');
      render({focus:false});
    }
    if (failure) {
      status.classList.add('is-error');
      status.textContent = failure.message === 'rate_limit' ? t.errors.rateLimit : t.errors.send;
      status.tabIndex = -1;
      status.focus();
      nextLabel.textContent = t.actions.retry;
      return;
    }
    status.textContent = '';
    form.hidden = true;
    complete.hidden = false;
    complete.querySelector('.complete-email').textContent = form.elements.email.value.trim();
    complete.querySelector('h2').focus();
  });
  document.querySelector('.intake-restart').addEventListener('click', () => {
    complete.hidden = true;
    form.hidden = false;
    current = 3;
    render();
  });
  const syncPhoneRegion = () => {
    form.querySelector('#phone-help').textContent = form.elements.phoneRegion.value === 'KR' ? t.phone.hintKR : t.phone.hintInternational;
    formatPhoneInput(form.elements.phone, form.elements.phoneRegion.value);
  };
  document.querySelectorAll('[data-language]').forEach(link => link.addEventListener('click', event => { if (sending || !persist()) event.preventDefault(); }));
  window.addEventListener('pagehide', () => controller?.abort());
  form.elements.phoneRegion.value = t.lang === 'ko' ? 'KR' : 'international';
  const stored = loadDraft(draftKey, references.map(input => input.value), (form.dataset.draftLegacyKeys || '').split(' '));
  if (stored.draft) {
    const draft = stored.draft;
    form.elements.phoneRegion.value = draft.phoneRegion;
    for (const name of draftFields) form.elements[name].value = draft.values[name];
    references.forEach(input => { input.checked = draft.references.includes(input.value); });
    unknown.checked = draft.unknown;
    if (draft.expanded || [...extraReferences.querySelectorAll('input')].some(input => input.checked)) expandReferences();
    let reachable = 0;
    while (reachable < 3 && requiredByStep[reachable].every(name => !errorFor(name))) reachable += 1;
    current = Math.min(draft.step, reachable);
    visited = Math.max(current, Math.min(draft.visited, reachable));
    editing = draft.editing && current < 3 && visited === 3;
  } else if (!stored.available) {
    reportStorageFailure(true);
  }
  syncPhoneRegion();
  render({focus:false});
  fields.disabled = false;
}

