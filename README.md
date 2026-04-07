# 컵케이크 마을

React, TypeScript, Zustand, Vite 기반으로 리팩토링한 컵케이크 수집 웹 게임입니다. 선물함, 굽기, 도감, 진열장을 페이지 단위로 분리해 유지보수와 확장이 쉬운 구조로 재구성했습니다.

## 지금 플레이하기

- 게임 시작: [컵케이크 마을 플레이](https://waqesd.github.io/daily_cupcake/)
- 저장소 보기: [GitHub 저장소](https://github.com/WAQESD/daily_cupcake)

## 스택

- React 19
- TypeScript
- Zustand
- Vite
- Vitest

## 핵심 시스템

- 90초마다 하나씩 쌓이는 랜덤 재료 배달 상자
- 데일리 선물과 오늘의 추천 레시피 보너스
- 2~5개 자유 조합과 재료 승급을 함께 처리하는 제작 시스템
- 발견형 컵케이크 도감과 즐겨찾기 진열장
- 로컬 스토리지 자동 저장과 세이브 내보내기/가져오기

## 로컬 실행

```powershell
npm install
npm run dev
```

테스트와 프로덕션 빌드는 아래 명령으로 확인할 수 있습니다.

```powershell
npm run test
npm run build
```

## GitHub Pages 배포

[deploy workflow](./.github/workflows/deploy.yml)는 `main` 또는 `master` 브랜치에 푸시되면 다음 순서로 자동 실행됩니다.

1. `npm ci`
2. `npm run test`
3. `npm run build`
4. `dist/` 아티팩트 업로드
5. GitHub Pages 배포

`Settings > Pages`에서 Source를 `GitHub Actions`로 설정해 두면 자동 배포됩니다.
