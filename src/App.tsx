import { startTransition, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { SaveTransferMenu } from "./components/SaveTransferMenu";
import { RECIPES } from "./data/gameData";
import { getDiscoveryProgressPercent } from "./lib/gameLogic";
import { useNow } from "./lib/useNow";
import { BakeryPage } from "./pages/BakeryPage";
import { CollectionPage } from "./pages/CollectionPage";
import { DeliveryPage } from "./pages/DeliveryPage";
import { HomePage } from "./pages/HomePage";
import { ShowcasePage } from "./pages/ShowcasePage";
import { useGameStore } from "./store/gameStore";
import type { PageId } from "./types/game";

const PAGE_ORDER: PageId[] = ["home", "bakery", "delivery", "collection", "showcase"];

const PAGE_META: Record<PageId, { label: string; description: string }> = {
  home: {
    label: "홈",
    description: "오늘 상태와 핵심 진행 상황을 먼저 확인해요.",
  },
  bakery: {
    label: "굽기",
    description: "가지고 있는 재료를 확인하고 새 컵케이크를 바로 구워요.",
  },
  delivery: {
    label: "선물함",
    description: "배달 상자와 오늘의 추천 레시피를 한 번에 관리해요.",
  },
  collection: {
    label: "도감",
    description: "발견한 레시피를 필터링해서 찾고 진행률을 확인해요.",
  },
  showcase: {
    label: "진열장",
    description: "좋아하는 컵케이크와 최근 제작 기록을 따로 모아 봐요.",
  },
};

export default function App() {
  const now = useNow();
  const syncDeliveryBoxes = useGameStore((state) => state.syncDeliveryBoxes);
  const { activePage, pendingBoxes, dailyStreak, discoveredRecipeIds, setActivePage } = useGameStore(
    useShallow((state) => ({
      activePage: state.activePage,
      pendingBoxes: state.pendingBoxes,
      dailyStreak: state.dailyStreak,
      discoveredRecipeIds: state.discoveredRecipeIds,
      setActivePage: state.setActivePage,
    })),
  );

  useEffect(() => {
    syncDeliveryBoxes(now);
  }, [now, syncDeliveryBoxes]);

  const discoveredCount = discoveredRecipeIds.length;
  const discoveryPercent = getDiscoveryProgressPercent(discoveredCount, RECIPES.length);

  function handlePageChange(page: PageId) {
    if (page === activePage) {
      return;
    }

    startTransition(() => {
      setActivePage(page);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="sky-decor sky-decor--left" />
      <div className="sky-decor sky-decor--right" />

      <main className="app-shell">
        <header className="app-header panel">
          <div className="app-header__brand">
            <p className="eyebrow">핑크 하트 베이커리</p>
            <strong className="app-header__brand-name">컵케이크 마을</strong>
            <p className="app-header__text">
              화면을 페이지별로 나눠서 필요한 기능만 집중해서 볼 수 있게 정리했어요.
            </p>
          </div>

          <div className="app-header__context">
            <span className="app-header__context-label">현재 페이지</span>
            <strong>{PAGE_META[activePage].label}</strong>
            <p>{PAGE_META[activePage].description}</p>
          </div>

          <div className="app-header__aside">
            <div className="app-header__summary">
              <article className="app-pill">
                <span className="app-pill__label">선물함</span>
                <strong>{`${pendingBoxes}상자`}</strong>
              </article>
              <article className="app-pill">
                <span className="app-pill__label">도감</span>
                <strong>{`${discoveryPercent}%`}</strong>
              </article>
              <article className="app-pill">
                <span className="app-pill__label">출석</span>
                <strong>{`${dailyStreak}일`}</strong>
              </article>
            </div>

            <div className="app-header__controls">
              <nav className="page-nav" aria-label="주요 메뉴">
                {PAGE_ORDER.map((pageId) => (
                  <button
                    key={pageId}
                    type="button"
                    className={`page-nav__button ${activePage === pageId ? "page-nav__button--active" : ""}`}
                    onClick={() => handlePageChange(pageId)}
                    aria-current={activePage === pageId ? "page" : undefined}
                  >
                    {PAGE_META[pageId].label}
                  </button>
                ))}
              </nav>

              <label className="page-select">
                <span>드롭다운 메뉴</span>
                <select value={activePage} aria-label="페이지 선택" onChange={(event) => handlePageChange(event.target.value as PageId)}>
                  {PAGE_ORDER.map((pageId) => (
                    <option key={pageId} value={pageId}>
                      {PAGE_META[pageId].label}
                    </option>
                  ))}
                </select>
              </label>

              <SaveTransferMenu />
            </div>
          </div>
        </header>

        <section className={`page-section ${activePage === "home" ? "is-active" : ""}`} hidden={activePage !== "home"}>
          <HomePage now={now} onNavigate={handlePageChange} />
        </section>

        <section className={`page-section ${activePage === "bakery" ? "is-active" : ""}`} hidden={activePage !== "bakery"}>
          <BakeryPage />
        </section>

        <section className={`page-section ${activePage === "delivery" ? "is-active" : ""}`} hidden={activePage !== "delivery"}>
          <DeliveryPage now={now} />
        </section>

        <section
          className={`page-section ${activePage === "collection" ? "is-active" : ""}`}
          hidden={activePage !== "collection"}
        >
          <CollectionPage />
        </section>

        <section className={`page-section ${activePage === "showcase" ? "is-active" : ""}`} hidden={activePage !== "showcase"}>
          <ShowcasePage />
        </section>
      </main>
    </>
  );
}
