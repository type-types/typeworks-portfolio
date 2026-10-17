import { processSteps } from './process.mjs';

const paths = {
  notes: '<rect x="4" y="3" width="14" height="18" rx="2"/><path d="M8 8h6M8 12h6M8 16h3M18 7h3v14"/>',
  screen: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M2 7h20M9 21h6M12 17v4M6 11h4M6 14h8"/>',
  check: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 2 2 5-5M8 16h8"/>',
  people: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21v-3a6 6 0 0 1 12 0v3M15 15a5 5 0 0 1 7 4v2"/>',
  data: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 19h2M3 8a6 6 0 0 0 0 8M21 8a6 6 0 0 1 0 8"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
  book: '<path d="M12 5C8 2 3 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-3-2-7-1-10 1ZM12 5v16"/>',
};

const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
const arrow = '<span class="diagram-arrow" aria-hidden="true">→</span>';
const node = (symbol, title, detail = '') => `<div class="flow-node">${icon(symbol)}<span>${title}</span>${detail ? `<small>${detail}</small>` : ''}</div>`;
const flow = (items) => `<div class="visual-flow">${items.map(([symbol, title, detail], index) => `${index ? arrow : ''}${node(symbol, title, detail)}`).join('')}</div>`;

export const journeyVisual = () => `<figure class="journey-visual"><div class="journey-heading"><span class="visual-dot" aria-hidden="true"></span><span>필요에서 시작해, 쓰는 순간까지.</span></div><div class="journey-scenes"><div class="journey-scene"><div class="paper-stack" aria-hidden="true"><i></i><i></i><i></i></div><span>흩어진 필요</span><small>메모, 자료, 반복 업무</small></div>${arrow}<div class="journey-scene"><div class="mini-browser" aria-hidden="true"><div class="mini-browser-bar"><i></i><i></i><i></i></div><div class="mini-browser-body"><span></span><b></b><b></b><em></em></div></div><span>작동하는 제품</span><small>사용 화면과 관리 도구</small></div>${arrow}<div class="journey-scene"><div class="guide-sheet" aria-hidden="true">${icon('check')}<i></i><i></i></div><span>이어지는 운영</span><small>직접 쓰는 방법까지</small></div></div><figcaption>필요를 정리하고, 제품을 만들고, 운영 방법을 전달합니다.</figcaption></figure>`;

export const planningPhoto = () => `<figure class="planning-photo"><img src="/assets/visuals/planning-v5.jpg" width="1536" height="1024" alt="함께 메모를 정리하며 필요한 일을 구체화하는 과정을 표현한 연출 사진" loading="lazy" decoding="async"></figure>`;

const serviceScreen = ({ className = '', slug, name, src, width, height, alt, caption, source }) => `<figure class="service-visual service-screen${className ? ` ${className}` : ''}"><a class="service-screen-window" href="/work/${slug}/" aria-label="${name} 실제 제작 사례 보기"><img src="${src}" width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async"></a><figcaption><span class="service-caption-copy">${caption}</span><small>${source}</small></figcaption></figure>`;
const serviceVisuals = {
  software: serviceScreen({
    slug: 'knet', name: 'K-NET', src: '/assets/portfolio/knet-study-editor.png', width: 1265, height: 712,
    alt: 'K-NET의 소개 편집과 실시간 미리보기 운영 화면, 데모 데이터',
    caption: '작성하는 화면과 확인하는 화면을 함께 만듭니다.', source: 'K-NET 운영 화면, 데모 데이터',
  }),
  automation: `<figure class="service-visual service-flow">${flow([['data','흩어진 자료'],['spark','AI로 정리'],['check','사람의 확인']])}<figcaption><span class="service-caption-copy">자료를 모으고 정리해, 판단하기 쉽게 연결합니다.</span><small>업무 도구와 AI 연결 개념</small></figcaption></figure>`,
  event: serviceScreen({
    className: 'event-visual', slug: 'ignition', name: 'IGNITION', src: '/assets/portfolio/ignition-07-screen.png', width: 1280, height: 720,
    alt: '곡 정보와 관객 반응을 보여주는 IGNITION의 공개 시연 화면',
    caption: '현장의 참여를 운영 화면에 연결합니다.', source: 'IGNITION 공개 시연 화면',
  }),
};
export const serviceVisual = (key) => {
  const visual = serviceVisuals[key];
  if (!visual) throw new Error(`Unknown service visual: ${key}`);
  return visual;
};
export const stepSymbol = (symbol) => `<span class="step-symbol">${icon(symbol)}</span>`;

export const connectionVisual = () => `<figure class="connection-visual"><div class="connection-inputs">${[
  ['screen','제품','실제로 쓰는 화면'],
  ['book','지식','함께 보는 안내'],
  ['data','데이터','쌓이는 업무 기록'],
  ['check','규칙','같은 운영 기준'],
].map(([symbol,title,detail]) => node(symbol,title,detail)).join('')}</div><div class="connection-join" aria-hidden="true"></div><div class="connection-result">${icon('people')}<span>사람이 일을 이어갈 수 있는 구조</span></div><figcaption>화면, 안내, 기록과 기준을 하나의 업무 흐름으로 연결합니다.</figcaption></figure>`;

export const processOverview = () => `<section class="wrap process-overview"><div class="process-photo">${planningPhoto()}</div><div class="overview-copy"><p class="eyebrow">함께 확인하는 네 단계</p><h2>무엇을 정하고,<br>무엇을 받는지 명확하게.</h2><ol class="overview-steps">${processSteps.map(({ number, overviewTitle, overviewDescription }) => `<li><span class="overview-number">${number}</span><div><span>${overviewTitle}</span><small>${overviewDescription}</small></div></li>`).join('')}</ol></div></section>`;

const stageVisuals = {
  needs: `<div class="stage-notes"><span>지금 하는 일</span><span>불편한 순간</span><span>원하는 변화</span></div>`,
  scope: `<div class="scope-sheet"><span class="scope-sheet-title">함께 정할 제작 범위</span><div>${['기능','완료 기준','일정','비용'].map(label => `<span>${icon('check')}${label}</span>`).join('')}</div></div>`,
  build: `<div class="stage-product">${icon('screen')}<span>작동하는 화면</span>${arrow}${icon('people')}<span>함께 확인</span></div>`,
  handover: `<div class="handover-set"><div>${icon('screen')}<span>제품</span></div><span aria-hidden="true">+</span><div>${icon('book')}<span>운영 안내</span></div>${arrow}<div>${icon('check')}<span>직접 사용</span></div></div>`,
};
export const stageVisual = ({ id, number }) => {
  const visual = stageVisuals[id];
  if (!visual) throw new Error(`Unknown process stage: ${id}`);
  return `<figure class="stage-visual stage-visual-${Number(number)}">${visual}</figure>`;
};

export const nfcVisual = () => `<figure class="technology-visual"><img src="/assets/visuals/nfc-visit-v5.jpg" width="1536" height="1024" alt="휴대전화를 책상 위 태그에 가까이 대는 방문 확인 개념 연출 사진" loading="lazy" decoding="async"><figcaption><span>태그 가까이 → 현장 방문 확인 → 기록 연결</span></figcaption></figure>`;

export const callVisual = () => `<figure class="technology-visual call-visual"><div class="call-visual-scene"><div class="call-device">${icon('phone')}<span>먼저 거는 전화</span></div><div class="voice-wave" aria-hidden="true">${[16,30,22,42,32,54,28,40,20,32,16].map(height => `<i style="--wave-height:${height}px"></i>`).join('')}</div><div class="call-record">${icon('notes')}<span>남겨지는 대화</span></div></div><figcaption><span>전화 연결 → AI와 대화 → 대화 기록</span></figcaption></figure>`;

export const estimateVisual = (contactLink) => `<div class="estimate-guide reveal"><ul class="estimate-factors">${[
  ['screen','기능과 완료 기준','필요한 화면과 기능, 전달할 결과물과 완료 상태를 정합니다.'],
  ['data','데이터와 외부 연동','연결할 데이터와 외부 서비스의 범위를 정합니다.'],
  ['book','운영 안내와 교육','내용 수정과 데이터 확인 등 직접 운영하는 방법을 안내합니다.'],
].map(([symbol,title,description]) => `<li>${icon(symbol)}<h3>${title}</h3><p>${description}</p></li>`).join('')}</ul><div class="estimate-summary"><div><h3>범위에 맞는 견적과 일정을 안내합니다.</h3><p>제작 기간, 확인 시점, 수정 횟수와 운영 지원 범위를 견적에 담습니다.</p></div>${contactLink}</div></div>`;
