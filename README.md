# 컵케이크 마을

핑크 도트 감성의 한글 컵케이크 수집 게임입니다. 랜덤 재료 배달을 받아 컵케이크를 굽고, 도감과 티파티 진열장을 천천히 채워 나가도록 만들었습니다.

## 주요 기능

- 90초마다 도착하는 랜덤 재료 배달 상자
- 데일리 오븐 선물과 오늘의 추천 레시피 보너스
- 반죽, 크림, 토핑, 마무리 재료 조합으로 만드는 625종 컵케이크
- 첫 제작 시 열리는 레시피 도감과 진행도 매트릭스
- 제작한 컵케이크를 올릴 수 있는 분홍 티파티 진열장
- 모든 진행 데이터 로컬 스토리지 저장

## 로컬 실행

정적 사이트라서 별도 빌드 없이 바로 열 수 있습니다.

1. 이 저장소를 클론합니다.
2. `index.html`을 브라우저에서 열거나 정적 서버로 실행합니다.

간단한 정적 서버 예시:

```powershell
python -m http.server 8080
```

그다음 브라우저에서 `http://localhost:8080` 으로 접속하면 됩니다.

## GitHub Pages 배포

저장소에 포함된 [deploy workflow](./.github/workflows/deploy.yml)는 `main` 또는 `master` 브랜치에 푸시되면 GitHub Pages로 자동 배포되도록 구성되어 있습니다.

### 필요한 설정

1. GitHub 저장소의 `Settings > Pages`로 이동합니다.
2. `Build and deployment`의 Source를 `GitHub Actions`로 설정합니다.
3. `main` 또는 `master` 브랜치에 푸시합니다.

이후 워크플로가 완료되면 GitHub Pages 주소가 생성됩니다.
