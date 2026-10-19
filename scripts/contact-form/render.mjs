import {portfolioCases, featuredSlugs, workSlugs} from '../../content/portfolio-cases.mjs';
import {caseMedia, escape} from '../site-components.mjs';
import {recipient, contactEndpoint} from '../../content/contact.mjs';
import {contactLocales, contactLocalePath} from '../../content/contact-locales/index.mjs';
const locales = contactLocales;
const forward = '<span aria-hidden="true">→</span>';
const required = ['name','company','email'];
for (const locale of Object.values(contactLocales)) {
  if (locale.lang !== 'ko' && workSlugs.some(slug => !locale.cases[slug]?.title || !locale.cases[slug]?.teaser)) throw new Error(`Missing case translations: ${locale.lang}`);
}
const extras = workSlugs.filter(slug => !featuredSlugs.includes(slug));
export function contactBody(t) {
  const card = slug => {
    const item = portfolioCases.find(entry => entry.slug === slug);
    const translated = t.cases[slug];
    const title = translated?.title || item.mobileTitle || item.title;
    const teaser = translated?.teaser || item.teaser;
    const media = caseMedia(item).replace(/alt="[^"]*"/g, `alt="${escape(title)}"`).replace(/<div class="flow-strip">[\s\S]*?<\/div>/g, '').replace(/<p class="concept-title">[\s\S]*?<\/p>/g, '').replace(/aria-label="[^"]*"/g, `aria-label="${escape(title)}"`);
    return `<label class="reference-card"><input type="checkbox" name="references" value="${slug}" aria-labelledby="reference-${slug}-title" aria-describedby="reference-${slug}-copy"><span class="reference-card-surface">${media}<span class="reference-card-check" aria-hidden="true">✓</span><span class="reference-card-copy"><span class="reference-title" id="reference-${slug}-title">${escape(title)}</span><span id="reference-${slug}-copy" class="reference-teaser">${escape(teaser)}</span></span></span></label>`;
  };
  const textField = (name, {type = 'text', max = 100, autocomplete = ''} = {}) => `<div class="intake-field" data-field="${name}"><label for="intake-${name}">${t.fields[name]}</label><input id="intake-${name}" name="${name}" type="${type}" maxlength="${max}"${required.includes(name) ? ' required' : ''}${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${type === 'email' ? ' inputmode="email" autocapitalize="none" spellcheck="false"' : ''}><p class="intake-field-error" id="error-${name}" hidden></p></div>`;
  const reviewRow = name => `<div><dt>${t.fields[name]}</dt><dd data-review="${name}"></dd></div>`;
  const reviewTitle = (name, index) => `<div class="review-group-title"><h3>${t.review[name]}</h3><button type="button" data-edit-step="${index}" aria-label="${t.review[name]}: ${t.review.edit}">${t.review.edit}</button></div>`;
  const heading = index => `<header class="intake-heading"><h2 id="intake-heading-${index}" tabindex="-1">${t.headings[index]}</h2><p>${t.descriptions[index]}</p></header>`;
  const localePath = locale => contactLocalePath(locale);
  const language = `<nav class="intake-language" aria-label="${t.accessibility.language}">${Object.values(locales).map(locale => `<a href="${localePath(locale.lang)}" lang="${locale.lang}" hreflang="${locale.lang}" data-language="${locale.lang}"${locale.lang === t.lang ? ' aria-current="true"' : ''}>${locale.label}</a>`).join('')}</nav>`;
  const phoneField = `<div class="intake-field" data-field="phone"><label for="intake-phone">${t.fields.phone}</label><div class="phone-input"><span class="phone-region"><select name="phoneRegion" id="intake-phone-region" aria-label="${t.phone.region}"><option value="KR">${t.phone.KR}</option><option value="international">${t.phone.international}</option></select></span><input id="intake-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="40" aria-describedby="phone-help"></div><p class="intake-help phone-help" id="phone-help">${t.phone.hintKR}</p><p class="intake-field-error" id="error-phone" hidden></p></div>`;
  const form = `<div class="intake-screen" id="intake-screen">
<form id="three-step-form" action="${contactEndpoint}" method="post" data-draft-key="typeworks:contact:four-step:v4" data-draft-legacy-keys="typeworks:contact:three-step:v3 typeworks:contact:three-step:v2 typeworks:contact:three-step:v1" aria-label="${t.accessibility.form}" novalidate>
  <fieldset class="intake-fields" disabled>
    <nav class="intake-progress" aria-label="${t.accessibility.progress}">${t.steps.map((label,index) => `<button type="button" data-intake-step="${index}" aria-controls="intake-panel-${index}"${index ? ' disabled' : ' aria-current="step"'}><span class="progress-number" aria-hidden="true">0${index+1}</span><span>${label}</span><span class="sr-only">${index+1} / 4 ${t.accessibility.step}</span></button>`).join('')}</nav>
    <div class="intake-panels">
      <section class="intake-panel" id="intake-panel-0" aria-labelledby="intake-heading-0" data-panel="0">${heading(0)}
        <div class="intake-contact-pair">${textField('name',{max:80,autocomplete:'name'})}${textField('company',{max:120,autocomplete:'organization'})}</div>
        <div class="intake-contact-pair">${textField('email',{type:'email',max:254,autocomplete:'email'})}${phoneField}</div>
      </section>
      <section class="intake-panel" id="intake-panel-1" aria-labelledby="intake-heading-1" data-panel="1" hidden>${heading(1)}
        <div class="intake-field reference-notes" data-field="referenceNotes"><label for="intake-referenceNotes">${t.fields.referenceNotes}</label><p class="intake-help" id="reference-notes-help">${t.help.referenceNotes}</p><textarea id="intake-referenceNotes" name="referenceNotes" rows="4" maxlength="2000" aria-describedby="reference-notes-help"></textarea><p class="intake-field-error" id="error-referenceNotes" hidden></p></div>
        <h3 class="reference-group-heading">${t.reference.group}</h3><div class="reference-grid" role="group" aria-label="${t.reference.group}">${featuredSlugs.map(card).join('')}</div>
        <div class="more-references"><button type="button" class="show-more-references" aria-controls="extra-references">${t.reference.more}<span aria-hidden="true">+</span></button><div id="extra-references" class="reference-grid" role="group" aria-label="${t.reference.extra}" hidden>${extras.map(card).join('')}</div></div>
        <label class="unknown-reference"><input type="checkbox" name="referenceUnknown" value="unknown"><span><strong>${t.reference.unknown}</strong><small>${t.reference.unknownHelp}</small></span><i aria-hidden="true">✓</i></label><p class="intake-field-error" id="error-references" hidden></p>
      </section>
      <section class="intake-panel" id="intake-panel-2" aria-labelledby="intake-heading-2" data-panel="2" hidden>${heading(2)}
        <div class="intake-plan-pair">${textField('budget')}<div class="intake-field" data-field="timeline"><label for="intake-timeline">${t.fields.timeline}</label><textarea id="intake-timeline" class="timeline-input" name="timeline" rows="3" maxlength="1000"></textarea><p class="intake-field-error" id="error-timeline" hidden></p></div></div>
        <div class="intake-field" data-field="message"><label for="intake-message">${t.fields.message}</label><p class="intake-help" id="message-help">${t.help.message}</p><textarea id="intake-message" name="message" rows="6" maxlength="6000" required aria-describedby="message-help"></textarea><p class="intake-field-error" id="error-message" hidden></p></div>
      </section>
      <section class="intake-panel" id="intake-panel-3" aria-labelledby="intake-heading-3" data-panel="3" hidden>${heading(3)}
        <div class="intake-review"><section class="review-group">${reviewTitle('contact',0)}<dl>${['name','company','email','phone'].map(reviewRow).join('')}</dl></section>
        <section class="review-group">${reviewTitle('references',1)}<p class="review-cases"></p><div class="review-reference-notes" hidden><p class="review-note-label">${t.review.notes}</p><p class="review-note-copy"></p></div></section>
        <section class="review-group">${reviewTitle('project',2)}<dl>${['budget','timeline','message'].map(reviewRow).join('')}</dl></section></div>
      </section>
    </div>
    <div class="contact-honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off" maxlength="200"></label></div>
    <footer class="intake-actions"><button type="button" class="intake-back"><span aria-hidden="true">←</span>${t.actions.back}</button><button type="submit" class="button intake-next"><span class="intake-next-label">${t.actions.next}</span>${forward}</button></footer>
  </fieldset>
  <p class="intake-draft-status is-unavailable" role="status" aria-live="polite" hidden></p><p class="intake-status" role="status" aria-live="polite"></p><noscript>${t.accessibility.noScript}</noscript>
</form>
<section class="intake-complete" hidden aria-labelledby="intake-complete-heading"><span class="complete-check" aria-hidden="true">✓</span><p class="eyebrow">${t.intro.eyebrow}</p><h2 id="intake-complete-heading" tabindex="-1">${t.complete.title}</h2><p>${t.complete.description}</p><p class="complete-email"></p><button type="button" class="intake-restart">${t.actions.restart}${forward}</button></section></div>`;
  const after = `<section class="intake-after"><div><p class="eyebrow">${t.after.estimate}</p><h2>${t.after.title}</h2><p>${t.after.description}</p></div><div><p class="eyebrow">${t.after.direct}</p><h2>${t.after.email}</h2><a href="mailto:${recipient}">${recipient}<span aria-hidden="true">↗</span></a></div></section>`;
  const main = `<section class="wrap intake-page" id="intake-start"><header class="intake-intro"><div class="intake-intro-top"><p class="eyebrow">${t.intro.eyebrow}</p>${language}</div><h1>${t.intro.title}</h1><p>${t.intro.description}</p></header>${form}${after}</section>`;
  return main;
}
