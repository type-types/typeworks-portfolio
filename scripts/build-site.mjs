import { mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { portfolioCases as cases, featuredSlugs, supportingSlugs, workSlugs } from '../content/portfolio-cases.mjs';
import { journeyVisual, planningPhoto, serviceVisual, stepSymbol, connectionVisual, processOverview, stageVisual, nfcVisual, callVisual, estimateVisual } from '../content/visuals.mjs';

const rootUrl = new URL('../', import.meta.url);
const root = fileURLToPath(rootUrl);
const assetVersion = async (path) => createHash('sha256').update(await readFile(new URL(path, rootUrl))).digest('hex').slice(0, 12);
const styleVersion = await assetVersion('style.css');
const legacyStyleVersion = await assetVersion('en/style.css');
const scriptVersion = await assetVersion('app.js');
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const arrow = '<span aria-hidden="true">↗</span>';
const button = (label, url, light = false) => `<a class="button${light ? ' button-light' : ''}" href="${url}">${label}${arrow}</a>`;
const textLink = (label, url) => `<a class="text-link" href="${url}">${label}${arrow}</a>`;
const navItems = [['about','회사소개'],['services','서비스와 비용'],['work','제작 사례'],['process','작업 방식']];
const navigation = (current) => navItems.map(([slug,label]) => `<a href="/${slug}/"${current === slug ? ' aria-current="page"' : ''}>${label}</a>`).join('');
const cta = () => `<section class="cta wrap reveal"><div><p class="eyebrow">프로젝트 상담</p><h2>만들고 싶은 것이 있나요?</h2><p>지금의 상황과 원하는 결과부터 말씀해 주세요.</p></div>${button('프로젝트 이야기하기','/contact/',true)}</section>`;
const footer = () => `<footer class="site-footer wrap"><div><a class="brand" href="/" aria-label="타입웍스 홈"><img src="/assets/brand-mark.svg" width="32" height="32" alt=""><span>typeworks.</span></a><p>필요를 이해하고, 제품을 만들고,<br>쓰는 방법을 공유합니다.</p></div><nav aria-label="하단 메뉴">${navigation('')}${textLink('제작 상담','/contact/')}</nav><div class="footer-bottom"><span>© 2026 Typeworks</span><a href="mailto:minseok@typeworks.pro">문의 minseok@typeworks.pro</a></div></footer>`;
const shell = (title, current, body, description, relative) => {
  const path = relative === '404.html' ? '/404.html' : '/' + relative.replace(/index\.html$/, '');
  const publicUrl = 'https://typeworks.pro' + path;
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${relative === '404.html' ? '<meta name="robots" content="noindex">' : ''}<meta name="description" content="${escape(description)}"><title>${escape(title)} | Typeworks</title><link rel="canonical" href="${publicUrl}"><meta name="theme-color" content="#ffffff"><meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="Typeworks"><meta property="og:title" content="${escape(title)} | Typeworks"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${publicUrl}"><meta property="og:image" content="https://typeworks.pro/assets/og-image.png"><meta name="twitter:card" content="summary_large_image"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:'Typeworks',alternateName:'타입웍스',url:'https://typeworks.pro/',logo:'https://typeworks.pro/assets/brand-mark.svg',description:'제품, 지식, 데이터, 규칙을 연결해 일이 돌아가는 구조를 만듭니다.',founder:{'@type':'Person',name:'박민석',alternateName:'Minseok Park'},sameAs:['https://www.linkedin.com/in/type-types']})}</script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css?v=${styleVersion}"><script src="/app.js?v=${scriptVersion}" defer></script></head>
<body><a class="skip-link" href="#main">본문으로 이동</a><div class="page-shell"><header class="site-header wrap"><a class="brand" href="/" aria-label="타입웍스 홈"><img src="/assets/brand-mark.svg" width="36" height="36" alt=""><span>typeworks.</span></a><button id="menu-toggle" class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="메뉴 열기"><span class="sr-only">메뉴</span><span class="menu-icon" aria-hidden="true"></span></button><nav id="site-nav" aria-label="주요 메뉴">${navigation(current)}<a class="nav-contact" href="/contact/"${current === 'contact' ? ' aria-current="page"' : ''}>프로젝트 상담 ${arrow}</a></nav></header><main id="main" tabindex="-1">${body.replace(/<br>\s*/g, '<br> ')}</main>${footer()}</div></body></html>`;
};
const pageHero = (label, title, description) => `<section class="page-hero wrap"><p class="eyebrow">${label}</p><h1>${title}</h1><p class="lead">${description}</p></section>`;
const caseMedia = (item, detail = false) => {
  if (item.visualType === 'screenshot') return `<div class="project-media screenshot-media ${item.slug}-media${detail ? ' detail-media' : ''}"><img src="${item.visual}" width="${item.visualWidth}" height="${item.visualHeight}" alt="${escape(item.visualAlt)}"${detail ? '' : ' loading="lazy"'}></div>`;
  if (item.slug === 'melissa') return `<div class="project-media melissa-media${detail ? ' detail-media' : ''}"><div class="phone-gallery">${[1,2,3].map((number) => `<img src="/assets/melissa-${number}.webp" width="221" height="480" alt="${['Melissa의 AI 캐릭터 소개','Melissa에서 AI와 나누는 대화','대화로 작성된 Melissa의 일기'][number-1]}" loading="lazy">`).join('')}</div></div>`;
  const icons = {
    ondam: '<path d="M17 12h10l5 13-6 5c5 10 11 16 21 21l5-6 13 5v10c0 4-3 7-7 6C31 62 14 45 10 22c-1-5 2-10 7-10Z"/><path d="M45 12c11 0 20 9 20 20M45 23c5 0 9 4 9 9"/>',
    'radio-gemma': '<rect x="8" y="10" width="26" height="49" rx="4"/><rect x="44" y="17" width="26" height="49" rx="4"/><path d="M15 24h12M15 34h12M15 44h8M51 31h12M51 41h12M51 51h8"/>',
    pathology: '<rect x="8" y="9" width="62" height="57" rx="5"/><path d="M18 55 33 38l9 10 12-18 10 25M26 21h23v29H26Z"/><circle cx="20" cy="24" r="4"/>',
  };
  return `<div class="project-media concept-media ${item.slug}-media${detail ? ' detail-media' : ''}" role="img" aria-label="${escape(item.title)}의 주요 기능 흐름: ${escape(item.flow.join(', '))}"><div class="concept-content" aria-hidden="true"><svg viewBox="0 0 78 78" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${icons[item.slug]}</svg><p class="concept-title">${item.coverTitle}</p><div class="flow-strip">${item.flow.map((label,index) => `${index ? '<span class="flow-arrow">→</span>' : ''}<span>${label}</span>`).join('')}</div></div></div>`;
};
const caseCard = (slug) => {
  const item = cases.find((entry) => entry.slug === slug);
  return `<article class="case-card reveal"><a href="/work/${item.slug}/" class="case-link">${caseMedia(item)}<div class="case-card-copy"><div class="case-meta"><span>${item.category}</span><span>${item.status}</span></div><div class="case-card-title"><h3>${item.title}</h3>${arrow}</div><p>${item.shortDescription}</p><span class="role">${item.role}</span><span class="visual-label">${item.visualLabel}</span></div></a></article>`;
};
const featuredCase = (slug) => {
  const item = cases.find((entry) => entry.slug === slug);
  return `<article class="featured-case reveal"><a class="featured-visual case-link" href="/work/${slug}/">${caseMedia(item)}<span class="visual-label">${item.visualLabel}</span></a><div class="featured-copy"><p class="eyebrow">${item.category}</p><h3><a href="/work/${slug}/">${item.title}</a></h3><p class="featured-description">${item.shortDescription}</p><div class="featured-facts"><span>${item.status}</span><p>${item.role}</p></div>${textLink('사례 자세히 보기', `/work/${slug}/`)}</div></article>`;
};
const services = [
  ['맞춤 소프트웨어','고객이 사용할 서비스와<br>운영자가 관리할 도구를 함께 만듭니다.','신청과 예약 / 회원 관리 / 신규 서비스'],
  ['업무 도구와 AI','흩어진 정보와 반복 작업을 연결하고,<br>필요한 단계에 AI를 적용합니다.','지식 관리 / 데이터 수집 / 업무 자동화'],
  ['공연과 현장 운영','참여자가 쓰는 화면과<br>현장을 진행하는 도구를 연결합니다.','관객 참여 / 행사 운영 / 현장 방문 확인'],
];
const serviceGrid = () => `<div class="service-grid">${services.map(([title,description,examples],index) => `<article class="service-item reveal"><h3>${title}</h3>${serviceVisual(index)}<p>${description}</p><p class="service-examples">${examples}</p></article>`).join('')}</div>`;
const processSteps = [
  ['01','필요를 이해합니다','지금 하는 일, 불편한 점과 원하는 결과를 함께 살펴봅니다.'],
  ['02','범위를 합의합니다','만들 기능, 완료 기준, 비용, 일정과 수정 범위를 정합니다.'],
  ['03','만들며 확인합니다','작동하는 화면을 공유하고 합의한 기준으로 함께 확인합니다.'],
  ['04','운영 방법을 전합니다','결과물을 전달하고 내용 수정과 운영 방법을 쉽게 알려드립니다.'],
];
const processGrid = () => `<ol class="process-grid">${processSteps.map(([number,title,description],index) => `<li class="reveal">${stepSymbol(index)}<span class="number">${number}</span><h3>${title}</h3><p>${description}</p></li>`).join('')}</ol>`;

const home = `<section class="hero wrap portfolio-hero hero-v5"><div class="hero-copy"><p class="eyebrow hero-label">소프트웨어 제작 스튜디오</p><h1>필요한 소프트웨어를,<br> 실제로 쓰는 제품으로.</h1><p class="lead">요구를 정리하고, 제품을 만들고, 쓰는 방법까지 전달합니다.</p><div class="hero-actions">${button('프로젝트 상담하기','/contact/')}${textLink('제작 사례 보기','#selected-work')}</div></div>${journeyVisual()}</section>
<section class="section selected-work wrap" id="selected-work"><div class="section-heading reveal"><div><p class="eyebrow">대표 제작 사례</p><h2>업무에서 연구와 현장까지.</h2></div>${textLink('전체 포트폴리오','/work/')}</div><div class="featured-work">${featuredSlugs.map(featuredCase).join('')}</div><p class="case-context">대표 박민석의 프로젝트 경험입니다. 상세 페이지에서 담당 역할과 화면을 확인하실 수 있습니다.</p></section>
<section class="section wrap portfolio-more"><div class="section-heading reveal"><div><p class="eyebrow">제품과 전달 경험</p><h2>함께 쓰고, 이해할 수 있도록.</h2></div></div><div class="case-grid">${supportingSlugs.map(caseCard).join('')}</div></section>
<section class="section wrap" id="services"><div class="section-heading reveal"><div><p class="eyebrow">제공하는 서비스</p><h2>필요한 기능을, 함께 구체화합니다.</h2></div>${textLink('서비스와 보유 기술','/services/')}</div>${serviceGrid()}</section>
<section class="section wrap work-together"><div class="section-heading reveal"><div><p class="eyebrow">함께 일하는 방식</p><h2>이해하고, 만들고, 전달합니다.</h2></div>${textLink('작업 방식 자세히 보기','/process/')}</div>${processGrid()}</section>${cta()}`;

const work = `${pageHero('포트폴리오','필요에서 출발한,<br>제품과 경험들.','소프트웨어 제작, 팀 운영과 기술을 전달한 경험입니다.')}<section class="section wrap work-list"><div class="case-grid portfolio-grid">${workSlugs.map(caseCard).join('')}</div><p class="case-context">대표의 기존 프로젝트 참여 경험을 포함합니다. 실제 화면, 데모 화면, 기능 소개 이미지와 콘텐츠 제작 시안을 사례별로 표시했습니다.</p></section>${cta()}`;

const servicePage = `${pageHero('서비스와 비용','필요한 기능을 정리하고,<br>사용할 제품을 만듭니다.','새로운 서비스, 반복되는 업무와 현장 운영에 필요한 소프트웨어를 제작합니다.')}<section class="section wrap">${serviceGrid()}<div class="scope-note reveal"><h2>화면만 만드는 데서 끝나지 않습니다.</h2><p>제품을 사용하는 사람과 관리하는 사람의 일을 함께 살펴봅니다. 필요한 정보, 데이터와 운영 규칙을 화면과 기능에 연결합니다.</p></div></section>
<section class="section technology-section" id="modules"><div class="wrap"><div class="section-heading reveal"><div><p class="eyebrow">보유 기술과 구현 경험</p><h2>필요한 곳에 연결할 기술.</h2></div></div><div class="technology-grid"><article class="technology-item reveal">${nfcVisual()}<span class="eyebrow">NFC 현장 방문 확인</span><h3>지문 인식기 설치 부담을 줄이는<br>현장 방문 확인 모듈.</h3><p>휴대전화와 NTAG 424 DNA 태그를 활용해 현장 방문을 확인하고, 방문 기록을 운영 도구에 연결할 수 있습니다.</p><p class="muted">방문자 본인 확인이 필요하면 인증 방식과 범위를 함께 정합니다.</p></article><article class="technology-item reveal">${callVisual()}<span class="eyebrow">AI 발신 전화</span><h3>AI가 먼저 전화를 걸고,<br>사용자와 대화합니다.</h3><p>SIP 전화 연결을 통해 발신, 대화와 기록을 이어갑니다. 온담 프로토타입에서 실제 전화로 이 흐름을 검증했습니다.</p>${textLink('온담 제작 사례','/work/ondam/')}</article></div></div></section>
<section class="section wrap" id="pricing"><div class="section-heading reveal"><div><p class="eyebrow">견적 기준</p><h2>범위를 정하면,<br>비용도 명확해집니다.</h2></div></div>${estimateVisual(textLink('제작 상담하기','/contact/'))}</section>${cta()}`;

const processPage = `${pageHero('작업 방식','같은 결과를 바라보도록,<br>함께 정하고 확인합니다.','좋은 제작은 요구를 이해하는 것과 명확하게 전달하는 것에서 시작합니다.')}${processOverview()}<section class="section wrap"><div class="process-detail">${processSteps.map(([number,title,description],index) => `<article class="process-row reveal"><header class="process-step-heading"><span class="number">${number}</span><div><h2>${title}</h2><p>${description}</p></div></header><div class="process-step-body">${stageVisual(index)}<ul class="process-checklist">${[
['현재 사용하는 도구와 일이 흐르는 방식 확인','사용자와 운영자에게 필요한 기능 정리'],
['납품할 기능과 산출물, 완료 기준 확정','견적, 일정, 수정과 운영 안내 범위 합의'],
['진행한 작업, 결정할 내용과 다음 작업 공유','실제 화면으로 기능 확인 및 피드백 반영'],
['합의한 결과물과 운영 자료 전달','실제 화면으로 내용 수정과 운영 방법 안내'],
][index].map((text) => `<li>${text}</li>`).join('')}</ul></div></article>`).join('')}</div><div class="scope-note reveal"><h2>추가로 필요한 일이 생기면,<br>범위와 일정을 다시 정합니다.</h2><p>합의한 수정과 새 기능 요청을 구분해 안내합니다. 변경할 내용과 비용, 일정에 합의한 뒤 작업에 반영합니다.</p></div><div class="faq-list reveal"><h2>상담 전에 궁금할 수 있는 것.</h2>${[
['기획서가 없어도 상담할 수 있나요?','지금 어떤 일을 하고 계신지, 어디에서 불편함이 생기는지부터 말씀해 주세요. 필요한 기능과 제작 범위를 함께 구체화합니다.'],
['제작 후 수정하는 방법도 알려주시나요?','내용 변경과 데이터 확인 등 합의한 운영 범위에 맞춰 실제 화면으로 안내합니다. 방법을 쉽고 간단하게 설명하는 것까지 제작 범위에 포함해 정합니다.'],
['수정 횟수와 제작 기간은 어떻게 정하나요?','기능 수, 화면과 연동 범위를 살펴보고 견적 단계에서 정합니다. 확정한 기준을 바탕으로 중간 확인과 납품을 진행합니다.'],
].map(([question,answer]) => `<details><summary>${question}<span aria-hidden="true">+</span></summary><p>${answer}</p></details>`).join('')}</div></section>${cta()}`;

const about = `<section class="about-hero wrap"><div class="about-copy"><p class="eyebrow">회사소개</p><h1>필요를 이해하고,<br>일이 돌아가는<br>구조를 만듭니다.</h1><p class="about-lead">흩어진 정보와 반복되는 작업을 살펴보고,<br>필요한 소프트웨어를 만듭니다.</p><p>제품, 지식, 데이터와 규칙을 연결하고, 직접 사용할 수 있도록 쓰는 방법까지 전달합니다.</p></div>${planningPhoto()}</section><section class="section wrap about-detail"><div class="section-heading reveal"><div><p class="eyebrow">우리가 중요하게 생각하는 것</p><h2>제품과 운영을 함께 연결합니다.</h2></div></div>${connectionVisual()}<div class="principles-grid">${[
['이해하고 구체화합니다','고객이 원하는 기능만 듣기보다, 그 기능이 필요한 이유와 사용 환경을 함께 이해합니다.'],
['함께 확인합니다','현재 무엇을 만들고 있고, 어떤 결정이 필요한지 작동하는 화면과 구체적인 작업으로 전달합니다.'],
['쉽게 전합니다','복잡한 설명을 줄이고, 고객이 실제로 할 일을 기준으로 제품과 운영 방법을 알려드립니다.'],
].map(([title,description]) => `<article class="reveal"><h3>${title}</h3><p>${description}</p></article>`).join('')}</div><div class="founder-section reveal"><div class="founder-portrait"><img src="/assets/founder-minseok.jpg" width="1499" height="1999" alt="타입웍스 대표 박민석" loading="lazy" decoding="async"></div><div><p class="eyebrow">대표 박민석</p><h2>대표 소개</h2><p class="large-copy">다양한 팀의 요구를 제품으로 만들고, 기획과 개발, 팀 운영과 발표를 경험했습니다.</p><p>Melissa에서는 PM과 초기 프로토타입 개발, 팀 운영을 맡았습니다. K-NET 운영 도구와 CSI 연구 도구, 공연 참여 모듈을 제작했고, 영상의학과 병리 연구 도구의 프론트엔드 개발에 참여했습니다.</p>${textLink('프로젝트별 담당 역할 보기','/work/')}</div></div><div class="vision-section reveal"><p class="eyebrow">앞으로의 방향</p><h2>직접 만들 수 있는 사람을 늘립니다.</h2><p>현재 중심 사업은 고객에게 필요한 소프트웨어 제작입니다. 제품 운영 교육을 바탕으로, AI를 활용해 필요한 것을 정의하고 제품을 만들며 공유하는 교육과 초중고 대상 학원 설립 및 운영도 구상하고 있습니다.</p></div></section>${cta()}`;

const contact = `${pageHero('프로젝트 상담','어떤 제품이<br>필요하신가요?','완성된 기획서가 없어도 괜찮습니다. 현재의 상황과 원하는 결과부터 알려주세요.')}<section class="section wrap contact-layout"><aside class="contact-aside"><h2>먼저 이런 내용을<br>이야기해 주세요.</h2><p>누가 사용할 제품인지,<br>어떤 일이 달라지면 좋을지,<br>예산과 희망 일정은 어느 정도인지.</p><div class="contact-guidance"><p class="eyebrow">견적 안내</p><p class="contact-price">필요한 기능과 범위를 기준으로.</p><p>원하는 결과와 제작 범위를 함께 정하고,<br>그에 맞춰 견적을 안내합니다.</p></div><p class="contact-instructions">작성한 상담 내용을 복사해 LinkedIn 메시지로 보내 주세요.</p><a class="text-link" href="https://www.linkedin.com/in/type-types" target="_blank" rel="noopener">LinkedIn에서 직접 연락하기 ${arrow}</a></aside><div class="contact-form-wrap"><form id="contact-form"><fieldset id="contact-fields" disabled><legend class="sr-only">프로젝트 상담 입력</legend><div class="form-grid"><label>회사 또는 소속<input name="company" autocomplete="organization" required placeholder="회사명 또는 개인"></label><label>성함<input name="name" autocomplete="name" required placeholder="담당자 성함"></label></div><label>이메일<input name="email" type="email" autocomplete="email" required placeholder="답변받으실 이메일"></label><label>필요한 작업<select name="projectType"><option value="맞춤 소프트웨어">맞춤 소프트웨어 제작</option><option value="업무 도구와 AI">업무 도구와 AI 적용</option><option value="공연과 현장 운영">공연과 현장 운영</option><option value="상담 후 결정">상담하며 정하고 싶어요</option></select></label><div class="form-grid"><label>예산 (선택)<input name="budget" maxlength="100" placeholder="정해진 예산이 있다면 적어 주세요."></label><label>희망 일정<input name="timeline" placeholder="예: 12월 중, 협의 가능"></label></div><label>현재 상황과 원하는 결과<textarea name="message" rows="6" required placeholder="어떤 일을 하고 계신지, 어떤 제품이나 변화가 필요한지 자유롭게 적어 주세요."></textarea></label><p class="form-note">이 화면은 상담 내용을 정리합니다. 작성 내용은 자동으로 전송되거나 저장되지 않습니다.</p><button class="button" type="submit">상담 내용 만들기 ${arrow}</button></fieldset><noscript><p class="form-note">이 브라우저에서는 자동 요약을 사용할 수 없습니다. LinkedIn에서 직접 연락해 주세요.</p></noscript></form><p id="form-status" class="form-status" role="status" aria-live="polite"></p><section id="summary-panel" class="summary-panel" hidden aria-labelledby="summary-title"><h2 id="summary-title">전달할 상담 내용</h2><label class="sr-only" for="contact-summary">상담 내용 요약</label><textarea id="contact-summary" rows="12" readonly></textarea><div class="summary-actions"><button id="copy-summary" class="button" type="button">상담 내용 복사하기</button><a class="button button-outline" href="https://www.linkedin.com/in/type-types" target="_blank" rel="noopener">LinkedIn 열기 ${arrow}</a></div><p>복사한 내용을 LinkedIn 메시지에 붙여넣어 전달해 주세요.</p></section></div></section>`;

const gallery = `<dialog id="image-dialog" aria-labelledby="dialog-title"><div class="dialog-heading"><h2 id="dialog-title">제품 화면</h2><button id="dialog-close" type="button" aria-label="확대 화면 닫기">닫기 <span aria-hidden="true">×</span></button></div><img id="dialog-image" src="/assets/portfolio/knet-study-editor.png" width="1265" height="712" alt="확대한 제품 화면"></dialog>`;
const galleryAttributes = (item, src, label) => `data-gallery-open="${item.slug}" data-gallery-src="${escape(src)}" data-gallery-alt="${escape(label)}" data-gallery-title="${escape(item.title)}"`;
const casePage = (item) => {
  const canEnlarge = item.visualType === 'screenshot';
  const screenGroups = item.screenGroups || (item.screens?.length ? [{ title: '사용하는 화면들.', screens: item.screens }] : []);
  const additionalScreens = screenGroups.map((group) => `<section class="screen-gallery reveal"><h2>${escape(group.title)}</h2>${group.description ? `<p class="screen-group-description">${escape(group.description)}</p>` : ''}<div class="screen-grid">${group.screens.map((screen) => `<a class="screen-tile" href="${screen.src}" ${galleryAttributes(item,screen.src,screen.title)}><span class="screen-image"><img src="${screen.src}" width="${screen.width}" height="${screen.height}" alt="${escape(screen.title)}" loading="lazy"></span><span class="screen-title">${escape(screen.title)}${arrow}</span></a>`).join('')}</div></section>`).join('');
  return `${pageHero(item.category,escape(item.title),escape(item.shortDescription))}<section class="case-detail wrap"><div class="case-facts"><div><span>담당 역할</span><p>${escape(item.role)}</p></div><div><span>진행 상태</span><p>${escape(item.status)}</p></div></div><figure class="case-figure reveal">${caseMedia(item,true)}<figcaption>${item.visualCaption}${canEnlarge ? `<button class="text-link gallery-open" type="button" ${galleryAttributes(item,item.visual,item.visualAlt)}>화면 크게 보기 ${arrow}</button>` : ''}</figcaption></figure>${additionalScreens}<div class="case-story"><article class="story-row reveal"><h2>필요했던 것</h2><p class="large-copy">${escape(item.problem)}</p></article><article class="story-row reveal"><h2>만든 것과 맡은 일</h2><ul>${item.approach.map((text) => `<li>${escape(text)}</li>`).join('')}</ul></article><article class="story-row reveal"><h2>결과</h2><div><p class="large-copy">${escape(item.result)}</p>${item.links.length ? `<div class="case-links">${item.links.map((link) => `<a class="text-link" href="${escape(link.url)}" target="_blank" rel="noopener">${escape(link.label)} ${arrow}</a>`).join('')}</div>` : ''}</div></article></div><div class="case-navigation">${textLink('전체 제작 사례','/work/')}${textLink('비슷한 프로젝트 상담하기','/contact/')}</div></section>${canEnlarge ? gallery : ''}${cta()}`;
};
const pages = [
  ['index.html','필요한 소프트웨어를 실제로 쓰는 제품으로','',home,'고객의 요구를 정리하고 소프트웨어로 제작합니다. 운영 방법 안내까지 함께하는 타입웍스.'],
  ['work/index.html','제작 사례','work',work,'K-NET, Melissa, 노놀, 연구와 공연 도구, AWS SBG 세션 및 홍보 콘텐츠의 제작 경험과 담당 역할.'],
  ['services/index.html','서비스와 비용','services',servicePage,'맞춤 소프트웨어, 업무 도구와 AI, 공연과 현장 운영. 제작 범위와 견적 기준.'],
  ['process/index.html','작업 방식','process',processPage,'요구 정리부터 범위 합의, 제작과 확인, 납품과 운영 안내까지.'],
  ['about/index.html','타입웍스 소개','about',about,'제품, 지식, 데이터와 규칙을 연결해 일이 돌아가는 구조를 만듭니다.'],
  ['contact/index.html','프로젝트 상담','contact',contact,'필요한 제품, 예산과 희망 일정을 정리해 제작 상담을 시작하세요.'],
  ...cases.map((item) => [`work/${item.slug}/index.html`,item.title,'work',casePage(item),item.summary]),
  ['404.html','페이지를 찾을 수 없습니다','',`${pageHero('404','페이지를 찾을 수 없습니다.','주소를 확인하거나 홈에서 다시 시작해 주세요.')}<div class="wrap not-found">${button('홈으로 돌아가기','/')}</div>`,'페이지를 찾을 수 없습니다.'],
];
for (const [relative,title,current,body,description] of pages) {
  const url = new URL(relative,rootUrl);
  await mkdir(fileURLToPath(new URL('.',url)),{recursive:true});
  await writeFile(url,shell(title,current,body,description,relative));
}
const publicPaths = pages.filter(([relative]) => relative !== '404.html').map(([relative]) => '/' + relative.replace(/index\.html$/, ''));
publicPaths.push('/en/');
await writeFile(new URL('sitemap.xml', rootUrl), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + publicPaths.map((path) => `  <url><loc>https://typeworks.pro${path}</loc></url>`).join('\n') + '\n</urlset>\n');

const legacyPageUrl = new URL('en/index.html', rootUrl);
const legacyPage = await readFile(legacyPageUrl, 'utf8');
await writeFile(legacyPageUrl, legacyPage.replace(/href="\/en\/style\.css(?:\?v=[a-f0-9]+)?"/, `href="/en/style.css?v=${legacyStyleVersion}"`));

const outputUrl = new URL('dist/', rootUrl);
await rm(outputUrl, { recursive: true, force: true });
await mkdir(outputUrl, { recursive: true });
const publishFiles = [...pages.map(([relative]) => relative), 'style.css', 'app.js', 'assets', 'en', 'site.webmanifest', 'robots.txt', 'sitemap.xml', 'CNAME', '.nojekyll'];
for (const relative of publishFiles) {
  await mkdir(new URL('.', new URL(relative, outputUrl)), { recursive: true });
  await cp(new URL(relative, rootUrl), new URL(relative, outputUrl), { recursive: true });
}
console.log(`Built ${pages.length} pages and prepared ${fileURLToPath(outputUrl)}`);
