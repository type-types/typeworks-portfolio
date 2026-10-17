export const processSteps = [
  {
    id: 'needs',
    number: '01',
    title: '필요를 이해합니다',
    description: '지금 하는 일, 불편한 점과 원하는 결과를 함께 살펴봅니다.',
    caption: '대화와 자료에서 필요한 일을 찾습니다.',
    symbol: 'people',
    overviewTitle: '필요 이해',
    overviewDescription: '현재 상황과 원하는 변화',
    checklist: [
      '현재 사용하는 도구와 일이 흐르는 방식 확인',
      '사용자와 운영자에게 필요한 기능 정리'
    ]
  },
  {
    id: 'scope',
    number: '02',
    title: '범위를 합의합니다',
    description: '만들 기능, 완료 기준, 비용, 일정과 수정 범위를 정합니다.',
    caption: '제작에 들어가기 전에 기준을 맞춥니다.',
    symbol: 'notes',
    overviewTitle: '범위 합의',
    overviewDescription: '기능, 일정과 완료 기준',
    checklist: [
      '납품할 기능과 산출물, 완료 기준 확정',
      '견적, 일정, 수정과 운영 안내 범위 합의'
    ]
  },
  {
    id: 'build',
    number: '03',
    title: '만들며 확인합니다',
    description: '작동하는 화면을 공유하고 합의한 기준으로 함께 확인합니다.',
    caption: '작동하는 결과물을 보면서 조정합니다.',
    symbol: 'screen',
    overviewTitle: '제작과 확인',
    overviewDescription: '작동하는 제품과 피드백',
    checklist: [
      '진행한 작업, 결정할 내용과 다음 작업 공유',
      '실제 화면으로 기능 확인 및 피드백 반영'
    ]
  },
  {
    id: 'handover',
    number: '04',
    title: '운영 방법을 전합니다',
    description: '결과물을 전달하고 내용 수정과 운영 방법을 쉽게 알려드립니다.',
    caption: '전달받은 뒤에도 직접 이어가도록 돕습니다.',
    symbol: 'book',
    overviewTitle: '전달과 안내',
    overviewDescription: '결과물과 사용하는 방법',
    checklist: [
      '합의한 결과물과 운영 자료 전달',
      '실제 화면으로 내용 수정과 운영 방법 안내'
    ]
  }
];
