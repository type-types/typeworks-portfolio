# Typeworks 영문 포트폴리오 검토본

K-NET, Nonol, Melissa를 소개하는 한 페이지 영문 웹사이트입니다.

## 열기

`index.html`을 브라우저로 열면 확인할 수 있습니다. Claude에 검토를 맡길 때는 이 폴더 전체 또는 `review/typeworks-portfolio.zip`을 전달하면 됩니다.

작업 위치는 `/Users/type/minseok_park/typeworks/portfolio`입니다.

## 파일

- `index.html`: 회사 소개, 제품 설명, 링크 및 검색 메타 정보
- `style.css`: 데스크톱과 모바일 화면 스타일
- `app.js`: 페이지 내 링크 이동 시 키보드 포커스 처리
- `assets/`: 실제 제품 화면, Melissa 공식 스토어 이미지 및 파비콘
- `robots.txt`, `sitemap.xml`: 향후 typeworks.pro 배포용 검색 설정
- `review/typeworks-portfolio.zip`: Claude에 전달할 검토용 소스 묶음
- `review/screenshots/`: 데스크톱, 태블릿 및 모바일 검토 화면
- `WORKLOG.md`: 완료 사항과 결정 이유

일반 HTML, CSS, JavaScript로 작성했으며 설치나 빌드 과정이 필요하지 않습니다. Google Fonts는 인터넷 연결 시 사용되고, 연결이 없으면 대체 서체로 표시됩니다.

## 내용 근거

- K-NET: https://k-net.kr/ 및 기존 프로젝트 자료
- Nonol: 제품 문서 및 https://nonol-original-concept.1991knet.workers.dev/
- Melissa: 개발 연혁 및 https://apps.apple.com/kr/app/melissa/id6741430491
- Typeworks 소개: 사용자가 제공한 관심 분야와 개발 방식

Nonol은 프로토타입이며, 연결된 체험 데모와 NFC 구현 범위를 구분했습니다. Melissa는 iOS 출시 상태로 소개했습니다. 각 제품을 동일한 Claude API 기반 제품으로 설명하지 않았습니다.

## 확인 사항

1440, 768, 390, 320픽셀 화면에서 가로 넘침, 이미지 로딩, 페이지 내 이동, 키보드 포커스, 외부 링크 및 JavaScript 오류를 확인했습니다. 동작 축소 설정도 반영했습니다.

이 폴더에는 웹사이트 검토용 정적 파일만 담았습니다. 호스팅 설정, 배포 스크립트 및 Git 메타 데이터는 포함하지 않았습니다.
