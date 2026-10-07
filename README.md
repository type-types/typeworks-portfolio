# Typeworks 영문 포트폴리오

K-NET, Nonol, Melissa를 소개하는 한 페이지 영문 웹사이트입니다. 공개 주소는 https://typeworks.pro 입니다.

## 열기와 수정

`index.html`을 브라우저로 열면 바로 확인할 수 있습니다. 일반 HTML, CSS, JavaScript로 작성했으며 설치나 빌드 과정이 없습니다.
Google Fonts는 인터넷 연결 시 사용되고, 연결이 없으면 대체 서체로 표시됩니다.

## 배포

- 호스팅: GitHub Pages, 저장소 https://github.com/type-types/typeworks-portfolio (main 브랜치 루트)
- 도메인: Squarespace에 등록된 typeworks.pro. DNS 레코드를 GitHub Pages로 가리키면 연결됩니다 (아래 참고).
- 배포 방법: main 브랜치에 푸시하면 1분 안에 자동 반영됩니다.

```bash
git add -A && git commit -m "내용" && git push
```

### typeworks.pro DNS 레코드 (Squarespace 도메인 관리 화면)

2026-10-08 적용 완료. Squarespace 기본 프리셋(Squarespace Defaults)을 삭제하고 아래를 커스텀 레코드로 넣었습니다.

| 종류 | 호스트 | 값 |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | type-types.github.io |

참고
- ALIAS 레코드는 이 도메인에 DNSSEC가 켜져 있어 Squarespace가 거부합니다. A 레코드 방식을 씁니다.
- AAAA(IPv6) 레코드는 선택 사항이라 넣지 않았습니다. 필요하면 2606:50c0:8000::153, 8001::153, 8002::153, 8003::153 네 개를 @ 에 추가합니다.
- Squarespace DNS 편집은 변경마다 패스키 재인증을 요구할 수 있습니다.
- GitHub 저장소 Settings > Pages 의 "Enforce HTTPS" 는 인증서 발급 후 켭니다.

## 파일

- `index.html`: 회사 소개, 제품 설명, 링크, 검색 및 공유용 메타 정보(OG 이미지, JSON-LD)
- `404.html`: 없는 주소로 들어왔을 때 보여 주는 페이지
- `style.css`: 데스크톱과 모바일 화면 스타일
- `app.js`: 페이지 내 링크 이동 시 키보드 포커스 처리
- `assets/`: 제품 화면(PNG 원본과 WebP), Melissa 공식 스토어 이미지, 파비콘, 터치 아이콘, OG 이미지
- `site.webmanifest`: 홈 화면 추가용 아이콘 정보
- `robots.txt`, `sitemap.xml`, `CNAME`, `.nojekyll`: 검색 설정과 GitHub Pages 배포 설정
- `review/`: 검토용 스크린샷과 ZIP (git에는 넣지 않음)
- `WORKLOG.md`: 완료 사항과 결정 이유

## 내용 근거

- K-NET: https://k-net.kr/ 및 기존 프로젝트 자료
- Nonol: 제품 문서 및 https://nonol-original-concept.1991knet.workers.dev/
- Melissa: 개발 연혁 및 https://apps.apple.com/kr/app/melissa/id6741430491
- Typeworks 소개: 사용자가 제공한 관심 분야와 개발 방식

Nonol은 프로토타입이며, 연결된 체험 데모와 NFC 구현 범위를 구분했습니다. Melissa는 iOS 출시 상태로 소개했습니다.
