# Typeworks 포트폴리오 작업 기록

## 2026-10-08 07:30 typeworks.pro DNS 연결

- 사용자가 Squarespace 패스키 재인증을 통과한 뒤 Squarespace Defaults 프리셋을 삭제했습니다.
- ALIAS @ -> type-types.github.io 를 시도했으나 DNSSEC 사용 도메인이라 거부됐습니다. A 레코드 4개와 www CNAME 으로 적용했습니다. AAAA 는 생략했습니다.
- 1.1.1.1, 8.8.8.8, Squarespace 네임서버 모두에서 새 레코드를 확인했고 http://typeworks.pro 가 포트폴리오를 서빙하는 것을 확인했습니다.
- GitHub Pages 에 도메인을 다시 저장해 HTTPS 인증서 발급을 걸었습니다.

## 2026-10-08 01:50 배포 준비와 GitHub Pages 공개

- 공유 미리보기용 OG 이미지(1200x630)와 JSON-LD Organization 정보, 트위터 카드 메타를 추가했습니다.
- 파비콘 PNG, 애플 터치 아이콘, 192/512 아이콘과 site.webmanifest를 추가했습니다.
- 제품 화면 이미지를 WebP로 변환하고 picture 요소로 분기했습니다 (Nonol 화면 534KB에서 80KB).
- 브라우저 프레임 주소 표시 글자가 hover 시 기준 요소가 바뀌어 미세하게 움직이던 CSS 버그를 고쳤습니다.
- 404 페이지, CNAME, .nojekyll, sitemap lastmod를 추가했습니다.
- Playwright로 1440, 768, 390, 320픽셀에서 가로 넘침, 콘솔 오류, 이미지와 폰트 로딩, 앵커 이동 후 포커스를 재확인했습니다. 문제 없음.
- git 저장소를 만들고 GitHub 공개 저장소 type-types/typeworks-portfolio 에 푸시한 뒤 GitHub Pages(main 루트)와 커스텀 도메인 typeworks.pro를 설정했습니다.
- 호스팅을 GitHub Pages로 고른 이유: Squarespace DNS를 그대로 두고 A/CNAME 레코드만 바꾸면 되기 때문입니다. Cloudflare Pages/Workers는 apex 도메인을 쓰려면 네임서버를 Cloudflare로 옮겨야 합니다.
- Pages 기본(레거시) 빌드가 즉시 실패해 GitHub Actions 워크플로(.github/workflows/pages.yml) 배포로 바꿨습니다. 걸려 있던 레거시 배포를 취소한 뒤 배포 성공을 확인했습니다.
- Squarespace DNS 변경은 재인증(패스키) 단계에서 멈췄습니다. 레코드 목록은 README에 정리했습니다.

## 2026-10-08 완료 내용

- K-NET, Nonol, Melissa의 기존 자료와 공개 화면을 확인하고 영문 포트폴리오를 제작했습니다.
- 제품별 상태와 체험 범위를 설명하고, 회사 소개와 LinkedIn 연락 링크를 구성했습니다.
- 데스크톱, 태블릿, 모바일 및 작은 모바일 화면에서 코드와 실제 사용 흐름을 점검했습니다.
- 사용자 요청에 따라 결과물을 로컬 검토용 파일과 ZIP으로 정리했습니다.
- 이미 공개했던 임시 사이트는 소유자만 접근하도록 전환하고 typeworks.pro 연결 등록을 해제했습니다.
- Squarespace 재인증 단계에서 도메인 설정 작업을 중단했으며, DNS 변경은 적용되지 않았습니다.

## 결과물

- 현재 폴더: 정적 웹사이트 파일 및 검토 안내
- `review/typeworks-portfolio.zip`: Claude에 전달할 수 있는 파일 묶음
- `review/screenshots/`: 검토 화면

## 작업 위치 이동

사용자 요청에 따라 소스, ZIP, 검토 화면 및 작업 기록을 `/Users/type/minseok_park/typeworks/portfolio`로 이동했습니다. 이동 전후 파일 해시로 소스 보존을 확인했습니다. 기존 `website` 지식 허브와 제품 폴더는 그대로 유지했습니다.
