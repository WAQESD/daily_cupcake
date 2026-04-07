import heroBakery from "../../assets/images/hero-bakery.png";
import { useShallow } from "zustand/react/shallow";
import { MAX_PENDING_BOXES, SHOWCASE_LIMIT } from "../config/game";
import { ACTIVE_RECIPE_IDS, RECIPES } from "../data/gameData";
import {
  getDiscoveryProgressPercent,
  getNextDeliveryCountdown,
  getTotalCraftedCount,
  getTotalInventoryCount,
  getTodayKey,
} from "../lib/gameLogic";
import { useGameStore } from "../store/gameStore";
import type { PageId } from "../types/game";

interface HomePageProps {
  now: number;
  onNavigate: (page: PageId) => void;
}

export function HomePage({ now, onNavigate }: HomePageProps) {
  const {
    inventory,
    collection,
    discoveredRecipeIds,
    favorites,
    pendingBoxes,
    dailyStreak,
    lastDailyClaimDate,
    lastDailyChallengeDate,
    lastDeliveryResolvedAt,
    deliveryMessage,
    craftMessage,
    challengeMessage,
    claimDailyGift,
    resetGame,
  } = useGameStore(
    useShallow((state) => ({
      inventory: state.inventory,
      collection: state.collection,
      discoveredRecipeIds: state.discoveredRecipeIds,
      favorites: state.favorites,
      pendingBoxes: state.pendingBoxes,
      dailyStreak: state.dailyStreak,
      lastDailyClaimDate: state.lastDailyClaimDate,
      lastDailyChallengeDate: state.lastDailyChallengeDate,
      lastDeliveryResolvedAt: state.lastDeliveryResolvedAt,
      deliveryMessage: state.deliveryMessage,
      craftMessage: state.craftMessage,
      challengeMessage: state.challengeMessage,
      claimDailyGift: state.claimDailyGift,
      resetGame: state.resetGame,
    })),
  );

  const discoveredCount = discoveredRecipeIds.filter((recipeId) => ACTIVE_RECIPE_IDS.has(recipeId)).length;
  const progressPercent = getDiscoveryProgressPercent(discoveredCount, RECIPES.length);
  const craftedEntries = Object.keys(collection).length;
  const totalCrafted = getTotalCraftedCount(collection);
  const inventoryTotal = getTotalInventoryCount(inventory);
  const todayKey = getTodayKey(now);
  const canClaimDailyGift = lastDailyClaimDate !== todayKey;
  const deliveryCountdown = getNextDeliveryCountdown(pendingBoxes, lastDeliveryResolvedAt, now);
  const homeActionMessage = challengeMessage || craftMessage || deliveryMessage;

  return (
    <>
      <header className="hero panel">
        <div className="hero__copy">
          <p className="eyebrow">오늘의 베이커리</p>
          <h1>컵케이크 마을</h1>
          <p className="hero__text">
            홈에서는 지금 꼭 확인해야 할 정보만 압축해서 보여줘요. 선물 수령 여부와 수집 진행 상황을 빠르게
            보고 필요한 페이지로 이동해요.
          </p>
          <div className="hero__chips">
            <span className="chip">페이지별 분리</span>
            <span className="chip">선물함 바로가기</span>
            <span className="chip">도감 집중 탐색</span>
          </div>
        </div>

        <div className="hero__visual">
          <figure className="hero-visual-card">
            <img src={heroBakery} alt="컵케이크와 재료가 놓인 베이커리 일러스트" />
          </figure>
        </div>

        <div className="hero__status">
          <div className="status-card">
            <span className="status-card__label">오늘 선물 상태</span>
            <strong>{canClaimDailyGift ? "오늘 선물을 받을 수 있어요" : "오늘 선물을 이미 받았어요"}</strong>
          </div>
          <div className="status-card">
            <span className="status-card__label">다음 배달까지</span>
            <strong>{deliveryCountdown}</strong>
          </div>
          <button
            type="button"
            className="pixel-button pixel-button--primary"
            onClick={claimDailyGift}
            disabled={!canClaimDailyGift}
          >
            오늘의 선물 받기
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-box panel">
          <span className="stat-box__label">발견한 레시피</span>
          <strong>{`${discoveredCount} / ${RECIPES.length}`}</strong>
          <span className="stat-box__sub">{`${progressPercent}%`}</span>
        </article>
        <article className="stat-box panel">
          <span className="stat-box__label">만든 컵케이크</span>
          <strong>{`${totalCrafted}개`}</strong>
          <span className="stat-box__sub">{`종류 ${craftedEntries}종`}</span>
        </article>
        <article className="stat-box panel">
          <span className="stat-box__label">선물함</span>
          <strong>{`${pendingBoxes}상자`}</strong>
          <span className="stat-box__sub">{`재료 ${inventoryTotal}개 보유 중`}</span>
        </article>
        <article className="stat-box panel">
          <span className="stat-box__label">연속 출석</span>
          <strong>{`${dailyStreak}일`}</strong>
          <span className="stat-box__sub">{`진열 중 ${favorites.length}종`}</span>
        </article>
      </section>

      <section className="home-grid">
        <article className="panel rail-panel home-card">
          <div className="section-heading section-heading--stack">
            <div>
              <p className="eyebrow">빠른 확인</p>
              <h2>오늘 챙길 것</h2>
            </div>
            <button type="button" className="mini-button" onClick={() => onNavigate("delivery")}>
              선물함 열기
            </button>
          </div>

          <div className="home-card__list">
            <article className="home-highlight">
              <span className="home-highlight__label">선물함 상태</span>
              <strong>{pendingBoxes > 0 ? `${pendingBoxes}상자 대기 중` : "새 상자를 기다리는 중"}</strong>
              <span className="section-heading__note">
                {pendingBoxes >= MAX_PENDING_BOXES ? "보관함이 가득 찼어요." : `다음 배달 ${deliveryCountdown}`}
              </span>
            </article>
            <article className="home-highlight">
              <span className="home-highlight__label">오늘 선물</span>
              <strong>{canClaimDailyGift ? "오늘 선물을 아직 받지 않았어요" : "오늘 선물을 이미 받았어요"}</strong>
              <span className="section-heading__note">
                {lastDailyChallengeDate === todayKey
                  ? "오늘 추천 레시피 보너스도 이미 완료했어요."
                  : "선물함 페이지에서 일일 보상과 추천 레시피를 확인할 수 있어요."}
              </span>
            </article>
          </div>

          <div className="message-box" aria-live="polite">
            {homeActionMessage}
          </div>
        </article>

        <article className="panel rail-panel home-card">
          <div className="section-heading section-heading--stack">
            <div>
              <p className="eyebrow">수집 요약</p>
              <h2>진행 상황</h2>
            </div>
            <button type="button" className="mini-button" onClick={() => onNavigate("collection")}>
              도감 보기
            </button>
          </div>

          <div className="home-card__list">
            <article className="home-highlight">
              <span className="home-highlight__label">도감 진행</span>
              <strong>{`${discoveredCount} / ${RECIPES.length} 발견`}</strong>
              <span className="section-heading__note">{`잠긴 레시피 ${RECIPES.length - discoveredCount}종`}</span>
            </article>
            <article className="home-highlight">
              <span className="home-highlight__label">진열장</span>
              <strong>{`${favorites.length} / ${SHOWCASE_LIMIT} 전시 중`}</strong>
              <span className="section-heading__note">{`최근 제작 ${totalCrafted}개`}</span>
            </article>
          </div>
        </article>
      </section>

      <section className="panel footer-panel">
        <div>
          <h2>저장 안내</h2>
          <p>진행 상황은 브라우저 로컬 저장소에 저장돼요. 같은 브라우저에서 다시 열면 이어서 플레이할 수 있어요.</p>
        </div>
        <button type="button" className="pixel-button pixel-button--danger" onClick={resetGame}>
          세이브 초기화
        </button>
      </section>
    </>
  );
}
