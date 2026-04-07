import deliveryBanner from "../generated/delivery-banner.png";
import { CupcakeArt } from "../components/CupcakeArt";
import { Tag } from "../components/Tag";
import { MAX_PENDING_BOXES } from "../config/game";
import { getDailyRecipe } from "../data/gameData";
import { getTodayKey } from "../lib/gameLogic";
import { useGameStore } from "../store/gameStore";

interface DeliveryPageProps {
  now: number;
}

export function DeliveryPage({ now }: DeliveryPageProps) {
  const {
    pendingBoxes,
    deliveryMessage,
    challengeMessage,
    lastDailyClaimDate,
    lastDailyChallengeDate,
    claimPendingBoxes,
    claimDailyGift,
  } = useGameStore((state) => ({
    pendingBoxes: state.pendingBoxes,
    deliveryMessage: state.deliveryMessage,
    challengeMessage: state.challengeMessage,
    lastDailyClaimDate: state.lastDailyClaimDate,
    lastDailyChallengeDate: state.lastDailyChallengeDate,
    claimPendingBoxes: state.claimPendingBoxes,
    claimDailyGift: state.claimDailyGift,
  }));

  const todayKey = getTodayKey(now);
  const dailyRecipe = getDailyRecipe(todayKey);
  const canClaimDailyGift = lastDailyClaimDate !== todayKey;
  const challengeCompleted = lastDailyChallengeDate === todayKey;

  return (
    <section className="panel rail-panel">
      <div className="section-heading section-heading--stack">
        <div>
          <p className="eyebrow">선물함</p>
          <h2>배달 상자와 오늘의 추천</h2>
        </div>
        <button type="button" className="pixel-button" onClick={claimPendingBoxes}>
          배달 상자 열기
        </button>
      </div>

      <figure className="scene-banner scene-banner--delivery">
        <img src={deliveryBanner} alt="" />
      </figure>

      <div className="delivery-stack">
        <article className="delivery-card">
          <h3>도착한 재료 상자</h3>
          <p>90초마다 상자가 1개씩 쌓이고, 상자 하나에는 반죽, 크림, 토핑, 마무리 재료가 하나씩 들어 있어요.</p>
          <div className="delivery-meta">
            <span>{`현재 ${pendingBoxes}상자 대기 중`}</span>
            <span>{`최대 ${MAX_PENDING_BOXES}상자까지 보관`}</span>
          </div>
          <div className="message-box" aria-live="polite">
            {deliveryMessage}
          </div>
        </article>

        <article className="delivery-card delivery-card--daily">
          <h3>오늘의 추천 레시피</h3>
          <div className="daily-recipe-card">
            <div className="daily-recipe-card__art">
              <CupcakeArt recipe={dailyRecipe} size="small" />
            </div>
            <div className="daily-recipe-card__copy">
              <strong>{dailyRecipe.name}</strong>
              <p>{dailyRecipe.ingredients.map((ingredient) => ingredient.name).join(" + ")}</p>
              <div className="daily-recipe-card__tags">
                <Tag label={dailyRecipe.collectionLabel} />
                <Tag label={dailyRecipe.rarityLabel} bright />
              </div>
              <span className="daily-recipe-card__status">
                {challengeCompleted ? "오늘 보너스 완료" : "오늘 완성하면 보너스 재료"}
              </span>
              <button
                type="button"
                className="mini-button"
                onClick={claimDailyGift}
                disabled={!canClaimDailyGift}
              >
                {canClaimDailyGift ? "오늘 선물 받기" : "오늘 선물 완료"}
              </button>
            </div>
          </div>
          <div className="message-box" aria-live="polite">
            {challengeMessage ||
              (challengeCompleted
                ? "오늘 추천 레시피 보너스는 이미 받았어요."
                : "오늘의 추천 레시피를 완성하면 추가 재료를 받을 수 있어요.")}
          </div>
        </article>
      </div>
    </section>
  );
}
