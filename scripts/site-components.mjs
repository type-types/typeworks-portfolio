import { portfolioCases as cases } from '../content/portfolio-cases.mjs';
import { services } from '../content/services.mjs';
import { processSteps } from '../content/process.mjs';
import { serviceVisual, stepSymbol, stageVisual } from '../content/visuals.mjs';

const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const arrow = '<span aria-hidden="true">↗</span>';
const button = (label, url, light = false) => `<a class="button${light ? ' button-light' : ''}" href="${url}">${label}${arrow}</a>`;
const textLink = (label, url) => `<a class="text-link" href="${url}">${label}${arrow}</a>`;

const caseMedia = (item, detail = false) => {
  if (item.visualType === 'screenshot') return `<div class="project-media screenshot-media ${item.slug}-media${detail ? ' detail-media' : ''}"><img src="${item.visual}" width="${item.visualWidth}" height="${item.visualHeight}" alt="${escape(item.visualAlt)}"${detail ? '' : ' loading="lazy"'}></div>`;
  if (item.visualType === 'phones') return `<div class="project-media melissa-media${detail ? ' detail-media' : ''}"><div class="phone-gallery">${[1,2,3].map((number) => `<img src="/assets/melissa-${number}.webp" width="221" height="480" alt="${['Melissa의 AI 캐릭터 소개','Melissa에서 AI와 나누는 대화','대화로 작성된 Melissa의 일기'][number-1]}" loading="lazy">`).join('')}</div></div>`;
  const icons = {
    ondam: '<path d="M17 12h10l5 13-6 5c5 10 11 16 21 21l5-6 13 5v10c0 4-3 7-7 6C31 62 14 45 10 22c-1-5 2-10 7-10Z"/><path d="M45 12c11 0 20 9 20 20M45 23c5 0 9 4 9 9"/>',
    'radio-gemma': '<rect x="8" y="10" width="26" height="49" rx="4"/><rect x="44" y="17" width="26" height="49" rx="4"/><path d="M15 24h12M15 34h12M15 44h8M51 31h12M51 41h12M51 51h8"/>',
    pathology: '<rect x="8" y="9" width="62" height="57" rx="5"/><path d="M18 55 33 38l9 10 12-18 10 25M26 21h23v29H26Z"/><circle cx="20" cy="24" r="4"/>',
  };
  return `<div class="project-media concept-media ${item.slug}-media${detail ? ' detail-media' : ''}" role="img" aria-label="${escape(item.title)}의 주요 기능 흐름: ${escape(item.flow.join(', '))}"><div class="concept-content" aria-hidden="true"><svg viewBox="0 0 78 78" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${icons[item.slug]}</svg><p class="concept-title">${item.coverTitle}</p><div class="flow-strip">${item.flow.map((label,index) => `${index ? '<span class="flow-arrow">→</span>' : ''}<span>${label}</span>`).join('')}</div></div></div>`;
};
const caseText = (full, brief) => brief ? `<span class="case-full">${escape(full)}</span><span class="case-brief">${escape(brief)}</span>` : escape(full);
const caseCard = (slug) => {
  const item = cases.find((entry) => entry.slug === slug);
  return `<article class="case-card reveal"><a href="/work/${item.slug}/" class="case-link">${caseMedia(item)}<div class="case-card-copy"><div class="case-meta"><span>${item.category}</span><span>${caseText(item.status, item.mobileStatus)}</span></div><div class="case-card-title"><h3>${caseText(item.title, item.mobileTitle)}</h3>${arrow}</div><p>${caseText(item.shortDescription, item.teaser)}</p><span class="role"><span class="case-role-label">담당 역할</span>${item.role}</span><span class="visual-label">${item.visualLabel}</span><span class="case-mobile-action">사례 보기${arrow}</span></div></a></article>`;
};
const featuredCase = (slug) => {
  const item = cases.find((entry) => entry.slug === slug);
  return `<article class="featured-case reveal"><a class="featured-visual case-link" href="/work/${slug}/">${caseMedia(item)}<span class="visual-label">${item.visualLabel}</span></a><div class="featured-copy"><p class="eyebrow">${item.category}</p><h3><a href="/work/${slug}/">${caseText(item.title, item.mobileTitle)}</a></h3><p class="featured-description">${caseText(item.shortDescription, item.teaser)}</p><div class="featured-facts"><span>${caseText(item.status, item.mobileStatus)}</span><p><span class="case-role-label">담당 역할</span>${item.role}</p></div>${textLink(`<span class="case-link-label">${caseText('사례 자세히 보기', '사례 보기')}</span>`, `/work/${slug}/`)}</div></article>`;
};

const serviceGrid = () => `<div class="service-grid">${services.map(({ title, description, examples, caseSlug, visual }) =>
  `<article class="service-item service-concept-card reveal"><h3>${title}</h3>${serviceVisual(visual)}<p>${description}</p><p class="service-examples">${examples}</p><a class="service-case-link" href="/work/${caseSlug}/" aria-label="${title} 관련 사례 보기">관련 사례 보기${arrow}</a></article>`
).join('')}</div>`;

const processGrid = () => `<ol class="process-grid">${processSteps.map(({ number, title, description, symbol }) =>
  `<li class="reveal">${stepSymbol(symbol)}<span class="number">${number}</span><h3>${title}</h3><p>${description}</p></li>`
).join('')}</ol>`;

const processDetail = () => `<div class="process-detail" id="process-steps">${processSteps.map((step) => {
  const { number, title, description, caption, checklist } = step;
  return `<article class="process-row reveal" id="stage-${Number(number)}"><header class="process-step-heading"><span class="number">${number}</span><h2>${title}</h2><p>${description} ${caption}</p></header><div class="process-step-body">${stageVisual(step)}<ul class="process-checklist">${checklist.map((text) => `<li>${text}</li>`).join('')}</ul></div></article>`;
}).join('')}</div>`;

export { escape, arrow, button, textLink, caseMedia, caseCard, featuredCase, serviceGrid, processGrid, processDetail };
