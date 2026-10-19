import {contactEndpoint} from '../../content/contact.mjs';
import {contactLocalePath} from '../../content/contact-locales/index.mjs';
import {contactCaseNames} from '../../content/contact-contract.mjs';

export function quickContact(t) {
  const q = t.quick;
  const field = (name, type, max, autocomplete) => `<div class="quick-field line-field"><label for="quick-${name}">${t.fields[name]}</label><div class="line-entry"><input id="quick-${name}" name="${name}" type="${type}" maxlength="${max}" autocomplete="${autocomplete}" enterkeyhint="next"${name !== 'phone' ? ' required' : ''}${type === 'email' ? ' inputmode="email" autocapitalize="none" spellcheck="false"' : ''} aria-describedby="quick-error-${name}"></div><p class="quick-error" id="quick-error-${name}" hidden></p></div>`;
  return `<button class="quick-launcher" id="quick-launcher" type="button" aria-label="${q.open}" aria-haspopup="dialog" aria-controls="quick-contact" aria-expanded="false" hidden><span class="quick-launcher-icon" aria-hidden="true"><svg class="quick-launcher-message" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 1 1 18 0Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M7 10h9M7 14h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><svg class="quick-launcher-cross" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></span><span class="quick-launcher-label">${q.label}</span></button>
<dialog id="quick-contact" class="quick-dialog" aria-labelledby="quick-heading">
  <div class="quick-heading"><div><h2 id="quick-heading" tabindex="-1">${q.title}</h2></div><button type="button" class="quick-close" aria-label="${q.close}"><span aria-hidden="true">×</span></button></div>
  <form id="quick-form" action="${contactEndpoint}" novalidate>
    <fieldset class="quick-fields">${field('name','text',203,'name')}${field('email','email',254,'email')}${field('phone','tel',40,'tel')}
      <div class="quick-field line-field"><label for="quick-message">${q.message}</label><div class="line-entry"><textarea id="quick-message" name="message" rows="3" maxlength="6000" required aria-describedby="quick-error-message"></textarea></div><p class="quick-error" id="quick-error-message" hidden></p></div>
      <div class="contact-honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off" maxlength="200"></label></div>
      <button type="submit" class="quick-send"><span class="quick-send-label">${q.send}</span><span aria-hidden="true">→</span></button>
    </fieldset>
    <p class="quick-status" role="status" aria-live="polite"></p>
    <p class="quick-storage" role="status" hidden></p>
    <a class="quick-detailed" href="${contactLocalePath(t.lang)}?from-quick">${q.detailed}<span aria-hidden="true">↗</span></a>
  </form>
  <section class="quick-complete" hidden><h3 tabindex="-1">${t.complete.title}</h3><p>${t.complete.description}</p><button type="button" class="quick-edit">${q.edit}</button></section>
</dialog><script id="quick-messages" type="application/json">${JSON.stringify({lang:t.lang,fields:t.fields,quick:t.quick,errors:t.errors,complete:t.complete,referenceIds:Object.keys(contactCaseNames)}).replace(/</g,'\\u003c')}</script>`;
}
