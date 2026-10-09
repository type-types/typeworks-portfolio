# Typeworks 회사 소개 사이트

제품 제작을 중심으로 철학, 작업 방식, 대표의 프로젝트 경험과 제작 상담을 소개하는 정적 웹사이트입니다. 공개 주소는 https://typeworks.pro 입니다.

한국어 회사 사이트를 기본으로 구성하고, 기존 영문 포트폴리오는 `/en/`에 보존했습니다.

## 열기와 수정

설치할 패키지는 없습니다. Node.js에서 다음 명령으로 페이지를 생성합니다.

```bash
npm run build
npm run check
```

로컬 미리보기는 프로젝트 폴더에서 다음 명령으로 엽니다.

```bash
python3 -m http.server 4317 --bind 127.0.0.1
```

브라우저에서 http://127.0.0.1:4317 을 엽니다. 사이트는 루트 기준 주소를 사용하므로 HTTP 서버로 확인합니다.

- 사례 수정: `content/cases.mjs`에서 프로젝트 설명, 역할과 링크를 바꾸고 `npm run build`를 실행합니다.
- 회사 소개와 서비스 수정: `scripts/build-site.mjs`의 해당 페이지 내용을 바꾸고 페이지를 다시 생성합니다.
- 문의 이메일 설정: `content/contact.mjs`의 `recipient`에 이메일을 넣고 페이지를 다시 생성합니다.
- 화면 스타일 수정: `style.css`를 수정하고 브라우저를 새로고침합니다.

Google Fonts는 인터넷 연결 시 사용되며, 연결이 없으면 대체 서체로 표시됩니다.

## 페이지와 파일 역할

| 경로 | 역할 |
| --- | --- |
| `index.html` | 한국어 홈 |
| `about/index.html` | 철학, 작업 원칙, 대표 소개와 비전 |
| `services/index.html` | 제작 범위, 진행 방식, 비용 기준과 인수인계 |
| `work/index.html` | 제작 사례 목록 |
| `work/<slug>/index.html` | 사례별 필요, 제작 내용, 결과와 담당 역할 |
| `contact/index.html` | 상담 내용 작성과 연락 안내 |
| `en/` | 기존 영문 포트폴리오 |
| `content/cases.mjs` | 사례 원본 데이터 |
| `content/contact.mjs` | 문의 수신 이메일 |
| `scripts/build-site.mjs` | 공통 탐색, 푸터, 페이지와 sitemap 생성 |
| `style.css`, `app.js` | 한국어 사이트 화면 및 메뉴, 상담 요약 기능 |
| `assets/` | 브랜드 SVG, 제품 화면, 아이콘과 공유 이미지 |
| `404.html` | 없는 주소 안내 |
| `site.webmanifest`, `robots.txt`, `sitemap.xml`, `CNAME`, `.nojekyll` | 검색 및 GitHub Pages 설정 |
| `review/` | 로컬 검토 화면과 자료, Git에는 포함하지 않음 |
| `WORKLOG.md` | 주요 완료 사항과 결정 이유 |

생성된 HTML도 Git에 포함합니다. GitHub Pages 배포 시 원본 데이터에서 페이지를 다시 생성합니다.

## 상담 기능

상담 입력값은 브라우저 화면에서 요약하는 데 사용됩니다. 서버 접수와 개인정보 저장 기능은 없습니다.

- 수신 이메일을 설정하면 이메일 앱에 상담 내용을 담아 열 수 있습니다. 방문자가 내용을 확인하고 전송합니다.
- 이메일이 미정인 현재 설정에서는 상담 요약을 복사해 기존 LinkedIn 연락 경로로 전달합니다.
- 자동 복사가 차단되면 요약을 선택해 직접 복사할 수 있습니다.

## 내용 기준

- 제품 제작이 현재 중심 사업입니다. 교육과 AI 학원 설립은 경험을 넓혀갈 방향과 구상 단계로 표시했습니다.
- 대표의 기존 프로젝트 참여 경험을 포함하며 팀 성과와 담당 역할을 구분했습니다.
- 500만~1,000만원은 상담하고자 하는 프로젝트 규모입니다. 실제 견적, 기간, 수정 횟수와 교육 범위는 개별 합의합니다.
- K-NET과 멜리사는 기존 실제 화면을 사용했습니다. CSI와 공연 사례의 도식은 기능 흐름 설명입니다.
- 기존 영문 페이지의 Nonol은 프로토타입으로 유지했습니다.

## 배포

- 호스팅: GitHub Pages, 저장소 https://github.com/type-types/typeworks-portfolio
- 배포: main 브랜치 푸시 후 `.github/workflows/pages.yml`에서 문법 점검과 페이지 생성, 배포를 진행합니다.
- 도메인: Squarespace에 등록한 typeworks.pro, GitHub Pages를 가리키는 DNS 레코드 유지

### DNS 기록

2026-10-08 적용한 레코드입니다.

| 종류 | 호스트 | 값 |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | type-types.github.io |

DNSSEC가 켜진 도메인에서 ALIAS 대신 A 레코드 방식을 사용했습니다. IPv6 레코드는 당시 설정에 포함하지 않았습니다.

## 내용 근거

- 사용자와 합의한 회사 철학, 강점, 사업 방향과 제작 범위
- 대표 역할 기록: https://app.notion.com/p/3d74d4feddec808cbdedd54c33d1c765
- 프로젝트 기록: https://app.notion.com/p/2f84d4feddec80bcb336e975f3b7dd2a
- K-NET: https://k-net.kr/
- CSI 도구: https://github.com/type-types/csi-data-collect-anno-tool
- 공연 모듈: https://github.com/type-types/IGNITION
- 멜리사: https://apps.apple.com/kr/app/melissa/id6741430491
- 영상의학: https://github.com/kw-idea/rad-mentor-buddy
- 병리 도구: https://github.com/kw-idea/DP_annotation_front
