import { cases as sourceCases } from './cases.mjs';

const presentation = {
  knet: {
    title: 'K-NET 운영 도구',
    shortDescription: '소개 편집과 신청 관리를 운영자가 직접 이어가는 도구입니다.',
    visualType: 'screenshot',
    visual: '/assets/portfolio/knet-study-editor.png',
    visualWidth: 1265,
    visualHeight: 712,
    visualAlt: 'K-NET 스터디 소개 편집과 실시간 미리보기 화면',
    visualLabel: '운영 화면 / 데모 데이터',
    visualCaption: '실제 제품에 가상 테스트 데이터를 넣어 촬영한 운영 화면입니다.',
    screens: [
      { src: '/assets/portfolio/knet-recruitment-settings.png', width: 1265, height: 712, title: '소개와 신청 접수 설정' },
      { src: '/assets/portfolio/knet-applicant-approval.png', width: 1265, height: 1199, title: '신청 내용 확인과 참여 승인' },
    ],
  },
  csi: {
    title: 'CSI 데이터 수집과 라벨링',
    shortDescription: '센서 데이터와 행동 구간을 연결해 연구용 라벨을 만드는 도구입니다.',
    visualType: 'screenshot',
    visual: '/assets/portfolio/csi-labeling.jpg',
    visualWidth: 1440,
    visualHeight: 900,
    visualAlt: 'CSI 데이터 도구의 세션 목록, 신호 그래프와 구간 라벨링 데모',
    visualLabel: '라벨링 화면 / 데모 데이터',
    visualCaption: '원본 제품의 화면 코드를 가상 데이터로 재현한 데모입니다.',
  },
  ignition: {
    title: 'IGNITION 공연 참여',
    shortDescription: '관객의 반응과 메시지를 공연 진행에 연결하는 현장 도구입니다.',
    visualType: 'screenshot',
    visual: '/assets/portfolio/ignition-07-screen.png',
    visualWidth: 1280,
    visualHeight: 720,
    visualAlt: 'IGNITION의 현재 곡, 관객 반응과 참여 안내를 보여주는 무대 화면',
    visualLabel: '공개 시연 화면',
    visualCaption: '프로젝트 공개 저장소에 수록된 실제 제품의 시연 화면입니다.',
    screens: [
      { src: '/assets/portfolio/ignition-01-setlist.png', width: 780, height: 1688, title: '관객이 쓰는 참여 화면' },
      { src: '/assets/portfolio/ignition-05-admin.png', width: 780, height: 1688, title: '진행자가 쓰는 제어 화면' },
    ],
  },
  melissa: {
    title: 'Melissa',
    shortDescription: 'AI와 나눈 대화를 하루의 일기로 남기는 앱입니다.',
    visualType: 'phones',
    visualLabel: '공식 App Store 소개 이미지',
    visualCaption: '공식 App Store에 공개된 제품 소개 이미지입니다.',
  },
  ondam: {
    title: '온담 AI 안부전화',
    shortDescription: 'AI가 전화를 걸어 대화하고 통화 내용을 기록하는 프로토타입입니다.',
    visualType: 'flow',
    visualLabel: '주요 기능 소개',
    coverTitle: '전화 한 통에서, 대화 기록까지.',
    flow: ['전화 연결', 'AI와 대화', '대화 기록'],
    visualCaption: '프로토타입의 주요 기능 흐름을 설명하는 소개 이미지입니다.',
  },
  'radio-gemma': {
    title: 'Radio-gemma 학습 시스템',
    shortDescription: '판독 사례를 비교하고 피드백을 확인하는 전공의 학습 시스템입니다.',
    visualType: 'flow',
    visualLabel: '주요 기능 소개',
    coverTitle: '판독을 비교하고, 다음 학습으로.',
    flow: ['판독 사례', '비교와 분석', '학습 피드백'],
    visualCaption: '참여한 연구 도구의 주요 기능을 설명하는 소개 이미지입니다.',
  },
  pathology: {
    title: '병리 이미지 편집 도구',
    shortDescription: '이미지를 배치하고 관심 영역을 표시해 주석과 함께 저장하는 도구입니다.',
    visualType: 'flow',
    visualLabel: '주요 기능 소개',
    coverTitle: '이미지와 주석을, 하나의 작업으로.',
    flow: ['이미지 배치', '영역과 주석', '저장과 불러오기'],
    visualCaption: '참여한 연구 도구의 주요 기능을 설명하는 소개 이미지입니다.',
  },
};

const additionalCases = [
  {
    slug: 'nonol',
    title: '노놀',
    subtitle: '현실에서 함께하는 모바일 퀘스트',
    category: '현장 경험과 제품 실험',
    status: '알파 신청 및 Test Lab 공개',
    role: '팀장, 기획과 AI 활용 제작',
    shortDescription: '장소, 미션과 팀원의 행동을 모바일 협동 퀘스트로 연결합니다.',
    summary: '현실의 장소에서 함께 미션을 수행하는 모바일 퀘스트를 기획하고, 신청 페이지와 팀 단위 Test Lab을 제작했습니다.',
    problem: '친구들이 현실의 장소에서 함께 미션을 수행하고 같은 진행 상태를 공유할 도구가 필요했습니다.',
    approach: [
      '알파 신청 페이지와 친구들이 함께 사용하는 실시간 팀 방을 만들었습니다.',
      '지도, 사진 인식, 정령과 벌점 정산 모듈을 Test Lab에 연결했습니다.',
      'NFC 방문 검증 모듈을 별도로 구현하고 현장 경험을 검증할 준비를 했습니다.',
    ],
    result: '신청 페이지와 Test Lab을 공개했습니다. 실제 운영 트랙 연결과 현장 검증을 위한 모듈 시험을 이어가고 있습니다.',
    links: [
      { label: '노놀 사이트', url: 'https://nonol.net/' },
      { label: 'Test Lab 체험', url: 'https://nonol.net/test-lab/' },
      { label: '프로젝트 저장소', url: 'https://github.com/2026-KW-HACKATHON/36_Nonol' },
    ],
    visualType: 'screenshot',
    visual: '/assets/portfolio/nonol-test-lab.jpg',
    visualWidth: 1265,
    visualHeight: 712,
    visualAlt: '노놀 Test Lab의 공개 소개와 친구와 체험하기 안내 화면',
    visualLabel: '공개 Test Lab 소개 화면',
    visualCaption: '2026년 10월 14일 공개 Test Lab 소개 페이지를 촬영한 화면입니다.',
    screenGroups: [
      {
        title: '함께 시험하는 모듈들.',
        description: '공개 소개 화면과 가상 팀원 데이터를 사용한 벌점 정산 테스트 화면입니다.',
        screens: [
          { src: '/assets/portfolio/nonol-test-lab-full.jpg', width: 1265, height: 1978, title: 'Test Lab의 퀘스트 모듈 소개' },
          { src: '/assets/portfolio/nonol-ending.png', width: 390, height: 1533, title: '팀 결과와 벌점 정산 / 데모 데이터' },
        ],
      },
    ],
  },
  {
    slug: 'aws-sbg',
    title: 'AWS SBG 세션과 홍보',
    subtitle: '기술을 이해하고 참여할 수 있도록 전하는 일',
    category: '교육과 콘텐츠',
    status: '세션 진행 / 홍보 자료 제작',
    role: '세션 진행, 강의 자료와 홍보 콘텐츠 제작',
    shortDescription: 'AWS 강의와 실습 자료, 인스타그램 홍보 콘텐츠로 활동을 전했습니다.',
    summary: '광운대학교 AWS Student Builder Group에서 세션을 진행하고 강의 자료와 인스타그램 피드용 홍보 콘텐츠를 제작했습니다.',
    problem: '참여자가 AWS 운영 개념을 이해하고 실습할 수 있는 자료와, 커뮤니티 활동을 알릴 홍보 콘텐츠가 필요했습니다.',
    approach: [
      'CloudWatch 공동 진행과 Cost Explorer, Budgets 설명을 맡고 강의 및 실습 자료를 준비했습니다.',
      '기술 개념과 확인 순서를 슬라이드와 실습 안내로 정리했습니다.',
      '커뮤니티 활동과 모집 정보를 인스타그램 피드용 캐러셀 시안으로 제작했습니다.',
    ],
    result: 'AWS SBG 세션을 진행하고 강의 및 실습 자료를 제작했습니다. 5기 모집을 안내하는 인스타그램 홍보 시안도 만들었습니다.',
    links: [],
    visualType: 'screenshot',
    visual: '/assets/portfolio/aws-sbg-session-cover.jpg',
    visualWidth: 1920,
    visualHeight: 1080,
    visualAlt: '박민석과 유정욱이 표기된 AWS SBG 핸즈온3 세션 안내 커버',
    visualLabel: '세션 안내 커버 / 제작 시안',
    visualCaption: 'AWS Student Builder Group 광운대 핸즈온 세션 안내용으로 제작한 커버입니다.',
    screenGroups: [
      {
        title: '강의와 실습 자료.',
        description: 'AWS 운영 입문과 CloudWatch 개념을 설명하는 발표 자료입니다.',
        screens: [
          { src: '/assets/portfolio/aws-sbg-lecture-cover.jpg', width: 934, height: 525, title: 'AWS 운영 입문' },
          { src: '/assets/portfolio/aws-sbg-cloudwatch.jpg', width: 934, height: 525, title: 'CloudWatch 개념 설명' },
          { src: '/assets/portfolio/aws-sbg-four-concepts.jpg', width: 934, height: 525, title: '로그, 지표와 알람 이해하기' },
        ],
      },
      {
        title: '인스타그램 홍보 콘텐츠.',
        description: '기존 커뮤니티 활동 사진과 모집 정보를 활용한 5기 모집 피드용 디자인 시안입니다.',
        screens: [1, 2, 3, 4].map((number) => ({
          src: `/assets/portfolio/aws-sbg-instagram-${number}.png`,
          width: 1080,
          height: 1350,
          title: `인스타그램 홍보 시안 ${number}`,
        })),
      },
    ],
  },
];

export const featuredSlugs = ['knet', 'melissa', 'csi', 'ignition'];
export const supportingSlugs = ['nonol', 'aws-sbg'];
export const workSlugs = ['knet', 'melissa', 'nonol', 'csi', 'ignition', 'ondam', 'radio-gemma', 'pathology', 'aws-sbg'];

export const portfolioCases = [...sourceCases.map((item) => ({
  ...item,
  ...presentation[item.slug],
})), ...additionalCases];
