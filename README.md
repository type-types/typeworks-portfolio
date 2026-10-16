# Typeworks 회사 소개 사이트

## v5-7 포커스 표시 수정

메뉴 열기와 닫기 및 이미지 확대 후 포인터 조작에 불필요한 포커스 테두리가 남지 않도록 입력 방식을 구분합니다. 키보드 탐색과 텍스트 입력창의 포커스 표시는 유지하고 메뉴 항목의 테두리는 안쪽에 표시합니다.

로컬 검토 주소는 http://127.0.0.1:4326/ 입니다. v5-6을 보존하고 v5-7 원본은 `previews/typeworks-v5-7-20261016/`에 보관합니다. 입력 방식 회귀 검사는 `scripts/focus-input.test.mjs`에서 관리하며 `npm test`로 실행합니다.


## v5-6 상담 이메일과 메뉴 개선

상담 내용을 이메일로 전송하는 Cloudflare Worker와 메뉴 아이콘 전환을 통합했습니다. 페이지와 메뉴가 바깥 여백, 둥근 모서리와 본문 여백을 공유하며 열기와 닫기 중 로고 및 버튼 위치를 유지합니다.

로컬 상담 검토 주소는 http://127.0.0.1:4324/contact/ 입니다. 이 검토 서버의 전송은 모의 처리입니다. 메뉴 전용 검토본은 `.worktrees/fix/menu-frame`과 http://127.0.0.1:4325/ 에 보존했습니다. v5-6의 배포 원본은 `previews/typeworks-v5-6-20261016/`에 보존합니다.

## v5-5 통합본

v4 공개본을 기준으로 홈, 회사소개, 서비스와 비용 및 작업 방식에 이해를 돕는 시각 자료를 추가했습니다. v5-4의 모바일 사례 구분과 전체 화면 메뉴, 서비스 및 견적 정리를 유지하고, v5-5에서는 메뉴의 열기와 닫기를 부드럽게 연결했습니다. 디자인 기준은 `DESIGN_SYSTEM.md`, 시각 자료 구성은 `content/visuals.mjs`에서 관리합니다.

검토 주소는 http://127.0.0.1:4323/ 이며, 보관본은 typeworks 작업 폴더의 `previews/typeworks-v5-5-20261016/`에 있습니다. 보관본 폴더에서 `npm run build`를 실행하고 `python3 -m http.server 4323 --bind 127.0.0.1 --directory dist`로 다시 열 수 있습니다. 기존 로컬 버전도 비교용으로 유지합니다.

제품 제작을 중심으로 철학, 작업 방식, 대표의 프로젝트 경험과 제작 상담을 소개하는 정적 웹사이트입니다. 공개 주소는 https://typeworks.pro 입니다.

한국어 회사 사이트를 기본으로 구성하고, 기존 영문 포트폴리오는 `/en/`에 보존했습니다.

## 열기와 수정

정적 사이트는 추가 패키지 설치 없이 Node.js에서 생성합니다.

```bash
npm run build
npm run check
npm test
```

로컬 미리보기는 프로젝트 폴더에서 다음 명령으로 엽니다.

```bash
python3 -m http.server 4317 --bind 127.0.0.1
```

브라우저에서 http://127.0.0.1:4317 을 엽니다. 사이트는 루트 기준 주소를 사용하므로 HTTP 서버로 확인합니다.

- 사례 수정: 기존 프로젝트 설명과 역할은 `content/cases.mjs`, 표시 이름과 이미지, 노놀 및 AWS SBG 사례와 노출 순서는 `content/portfolio-cases.mjs`에서 관리합니다. 수정 후 `npm run build`를 실행합니다.
- 회사 소개와 서비스 수정: `scripts/build-site.mjs`의 해당 페이지 내용을 바꾸고 페이지를 다시 생성합니다.
- 연락 경로 수정: `content/contact.mjs`의 수신 주소 및 서버 주소와 `scripts/build-site.mjs`의 상담 안내를 수정합니다.
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
| `content/portfolio-cases.mjs` | 사례 표시 정보, 신규 사례와 노출 순서 |
| `content/contact.mjs` | 상담 이메일과 전송 서버 주소 |
| `contact-api/` | Cloudflare 상담 전송 서버와 검증 코드 |
| `content/visuals.mjs` | 홈과 주요 페이지의 설명 도식과 사진 구성 |
| `content/visual-sources-v5.json` | 생성 사진의 도구, 목적과 프롬프트 기록 |
| `DESIGN_SYSTEM.md` | v5의 브랜드 톤과 시각 자료 기준 |
| `scripts/build-site.mjs` | 공통 탐색, 푸터, 페이지와 sitemap 생성 |
| `style.css`, `app.js` | 한국어 사이트 화면 및 메뉴, 상담 전송 기능 |
| `assets/` | 브랜드 SVG, 제품 화면, 아이콘과 공유 이미지 |
| `assets/visuals/` | 협업과 NFC 방문 확인을 설명하는 연출 사진 |
| `404.html` | 없는 주소 안내 |
| `site.webmanifest`, `robots.txt`, `sitemap.xml`, `CNAME`, `.nojekyll` | 검색 및 GitHub Pages 설정 |
| `review/` | 로컬 검토 화면과 자료, Git에는 포함하지 않음 |
| `dist/` | 공개 배포 파일, 빌드 때 생성하며 Git에는 포함하지 않음 |
| `WORKLOG.md` | 주요 완료 사항과 결정 이유 |

생성된 HTML도 Git에 포함합니다. GitHub Pages 배포 시 원본 데이터에서 페이지를 다시 생성하고 `dist/`의 공개 파일만 업로드합니다. 기존 영문 포트폴리오와 관련 자산도 배포 파일에 포함합니다.

## 상담 기능

상담 폼은 Cloudflare Worker의 `/api/contact`에 JSON을 전송합니다. 서버가 메일 전송을 수락한 뒤 완료 화면을 표시합니다. 회신 주소에는 작성자가 입력한 이메일을 설정합니다.

- 서버는 입력 형식과 길이, 허용 출처를 검증하고 IP별 분당 3회로 전송을 제한합니다.
- 전송 실패나 시간 초과 시 입력값을 유지하고 재시도 및 직접 이메일 문의를 안내합니다.
- 별도 상담 데이터베이스를 사용하지 않으며 메일은 수신함에 보관됩니다. 앱 로그에는 전송 결과 코드만 기록합니다.
- 자바스크립트 사용이 어려우면 직접 이메일 링크를 이용할 수 있습니다.

서버 패키지는 `contact-api`에서 `npm ci`로 설치하고 `npm run dev`로 실행합니다. 배포에는 회사 Cloudflare 계정의 Workers Scripts Write 권한이 필요합니다. 프로젝트 전용 토큰을 환경 변수 `CLOUDFLARE_API_TOKEN`으로 전달하고 `contact-api`에서 `npm run deploy`를 실행합니다. 토큰은 저장소에 포함하지 않습니다. 수신 대상은 인증된 `minseok@typeworks.pro`로 제한합니다. 실제 전송 수락, Gmail 수신 및 회신 주소를 확인했습니다. 정적 사이트 배포와 서버 배포는 별도 명령으로 진행합니다.

## 내용 기준

- 제품 제작이 현재 중심 사업입니다. 교육과 AI 학원 설립은 경험을 넓혀갈 방향과 구상 단계로 표시했습니다.
- 대표의 기존 프로젝트 참여 경험을 포함하며 팀 성과와 담당 역할을 구분했습니다.
- 예산은 선택 입력이며, 기능과 범위에 따라 견적, 기간, 수정 횟수와 운영 안내 범위를 개별 합의합니다.
- K-NET은 실제 제품에 가상 데이터를 넣은 화면, CSI는 원본 화면 코드와 가상 데이터로 구성한 데모, IGNITION은 공개 시연 화면을 사용합니다. Melissa는 공식 App Store 소개 이미지를 사용합니다.
- 노놀은 알파 신청 및 Test Lab 공개 단계로 소개합니다. AWS SBG 사례는 세션 진행, 강의 자료와 인스타그램 홍보 시안 제작 경험입니다.
- 기존 영문 페이지의 Nonol은 프로토타입으로 유지했습니다.
- 홈과 제품 제작 페이지에서 NFC 현장 방문 확인 모듈과 SIP 연결을 통한 AI 발신 전화 기술을 소개합니다. 보유 기술과 구현 경험은 대표가 제공한 내용을 근거로 작성했습니다.
- NFC는 현장 태그를 통한 방문 확인으로 설명하고, 방문자 본인 인증과 구분합니다.

## 배포

- 호스팅: GitHub Pages, 저장소 https://github.com/type-types/typeworks-portfolio
- 배포: main 브랜치 푸시 후 `.github/workflows/pages.yml`에서 문법 점검과 페이지 생성, `dist/` 업로드 및 배포를 진행합니다.
- 도메인: Squarespace에 등록한 typeworks.pro, GitHub Pages를 가리키는 DNS 레코드 유지
- HTTPS: 인증서를 확인하고 자동 전환을 적용했습니다. HTTP 주소는 HTTPS로 이동합니다.

### v1 원본 백업

회사 소개 사이트 배포 직전 공개되었던 영문 포트폴리오를 `v1` 태그로 보관했습니다.

- 원본: `dc3649f98e3dd95a4f3f8c43d29ee56823289199`
- GitHub: https://github.com/type-types/typeworks-portfolio/tree/v1
- 로컬 ZIP: `../backups/v1/typeworks-v1.zip`
- 검증 기록: `../backups/v1/manifest.json`

ZIP에 포함된 29개 파일이 원본 커밋의 내용과 일치하는지 확인했습니다. 현재 `/en/` 페이지는 새 사이트에 맞게 경로와 일부 공통 자산을 조정한 버전이며, 배포 전 원본은 위 백업에 있습니다.

### v4 배포 전 백업

2026-10-14 현재 공개본을 v4 배포 전에 보관했습니다. 공개 홈, CSS와 JavaScript가 아래 원본 커밋의 파일과 일치함을 확인했습니다.

- 원본: `dd7e83e1a2eeebb7e54291664b3f0adbf0580a78`
- GitHub: https://github.com/type-types/typeworks-portfolio/tree/pre-v4-20261014-125111
- 로컬 ZIP: `../backups/pre-v4-20261014-125111/typeworks-pre-v4.zip`
- 검증 기록: `../backups/pre-v4-20261014-125111/manifest.json`

ZIP의 49개 파일이 원본 커밋과 일치함을 확인했습니다. 기존 `v1` 백업도 유지합니다.

### v5-3 배포 전 백업

사용자가 확인한 v5-3 통합본의 배포 전에 기존 공개본을 보관했습니다.

- 원본: `d1e86b258f1edcdba071f372bdc59811e30ad36e`
- Git 태그: `pre-v5-20261016-113230`
- 로컬 ZIP: `../backups/pre-v5-20261016-113230/typeworks-pre-v5.zip`
- 검증 기록: `../backups/pre-v5-20261016-113230/manifest.json`

ZIP의 73개 파일이 원본 커밋과 일치함을 확인했습니다. 각 로컬 검토본도 별도 폴더에 유지합니다.

### v5-4 배포 전 백업

- 원본: `af51349669f1d0b5042800dae35369ebbe85a58f` (v5-3)
- Git 태그: `pre-v5-4-20261016-121123`
- 로컬 ZIP: `../backups/pre-v5-4-20261016-121123/typeworks-pre-v5-4.zip`
- 검증 기록: `../backups/pre-v5-4-20261016-121123/manifest.json`

ZIP의 78개 파일이 기존 공개 원본과 일치함을 확인했습니다.

### v5-5 배포 전 백업

- 원본: `c3bf4114f18fde1cda0e8e49e8e28ef9f57424e1` (v5-4 및 푸터 연락 경로 수정)
- Git 태그: `pre-v5-5-20261016-135410`
- 로컬 ZIP: `../backups/pre-v5-5-20261016-135410/typeworks-pre-v5-5.zip`
- 검증 기록: `../backups/pre-v5-5-20261016-135410/manifest.json`

ZIP의 모든 파일을 원본 커밋과 비교했습니다.

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
- Melissa: https://apps.apple.com/kr/app/melissa/id6741430491
- 노놀: https://nonol.net/test-lab/
- 영상의학: https://github.com/kw-idea/rad-mentor-buddy
- 병리 도구: https://github.com/kw-idea/DP_annotation_front
- NTAG 424 DNA 기술 설명: https://www.nxp.com/docs/en/data-sheet/NT4H2421Gx.pdf
- SIP 전화 연결 표준: https://www.rfc-editor.org/rfc/rfc3261.html

### v5-6 배포 전 백업

- 원본: `c10b0641d589a0b10bdf8e6dc09a2e935e79b9f8`
- Git 태그: `pre-v5-6-20261016-1710`
- 로컬 ZIP: `../backups/pre-v5-6-20261016-1710/typeworks-pre-v5-6.zip`
- 검증 기록: `../backups/pre-v5-6-20261016-1710/manifest.json`, 원본 78개 파일

### v5-7 배포 전 백업

- 원본: `a59aa6832777867fd135f444c51302156db1dc95`
- Git 태그: `pre-v5-7-20261016-1812`
- 로컬 ZIP: `../backups/pre-v5-7-20261016-1812/typeworks-pre-v5-7.zip`
- 검증 기록: `../backups/pre-v5-7-20261016-1812/manifest.json`
