import collectionBanner from "../../assets/images/collection-banner-v1.png";
import { useDeferredValue, useState } from "react";
import { CupcakeArt } from "../components/CupcakeArt";
import { Tag } from "../components/Tag";
import { COLLECTION_META, RARITY_META, RECIPE_MAP, RECIPES } from "../data/gameData";
import { getDiscoveryProgressPercent } from "../lib/gameLogic";
import { useGameStore } from "../store/gameStore";

export function CollectionPage() {
  const { discoveredRecipeIds, collection } = useGameStore((state) => ({
    discoveredRecipeIds: state.discoveredRecipeIds,
    collection: state.collection,
  }));

  const [rarityFilter, setRarityFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  const deferredSearchText = useDeferredValue(searchText.trim().toLowerCase());
  const discoveredCount = discoveredRecipeIds.length;
  const progressPercent = getDiscoveryProgressPercent(discoveredCount, RECIPES.length);
  const discoveredSet = new Set(discoveredRecipeIds);

  const filteredRecipes = discoveredRecipeIds
    .map((recipeId) => RECIPE_MAP.get(recipeId))
    .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe))
    .filter((recipe) => (rarityFilter === "all" ? true : recipe.rarity === rarityFilter))
    .filter((recipe) => (collectionFilter === "all" ? true : recipe.collection === collectionFilter))
    .filter((recipe) => {
      if (!deferredSearchText) {
        return true;
      }

      const haystack = [
        recipe.name,
        recipe.description,
        recipe.collectionLabel,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(deferredSearchText);
    })
    .sort((left, right) => {
      const rightCraftedAt = collection[right.id]?.lastCraftedAt ?? 0;
      const leftCraftedAt = collection[left.id]?.lastCraftedAt ?? 0;
      return rightCraftedAt - leftCraftedAt;
    });

  return (
    <>
      <section className="panel rail-panel">
        <div className="section-heading section-heading--stack">
          <div>
            <p className="eyebrow">스크랩 무드</p>
            <h2>컬렉션 화면 톤 정리</h2>
          </div>
          <span className="section-heading__note">새 배너를 추가해서 수집 페이지도 같은 베이커리 무드로 이어지게 했습니다.</span>
        </div>

        <figure className="page-banner page-banner--collection">
          <img src={collectionBanner} alt="컵케이크 사진 카드와 스크랩북 메모가 놓인 파스텔 컬렉션 배너" />
        </figure>
      </section>

      <div className="page-grid page-grid--collection">
        <section className="panel rail-panel">
        <div className="section-heading section-heading--stack">
          <div>
            <p className="eyebrow">수집 기록</p>
            <h2>도감 진행 상황</h2>
          </div>
          <span className="section-heading__note">전체 진행률은 한눈에, 상세 검색은 오른쪽 목록에서 확인해요.</span>
        </div>

        <div className="progress-block">
          <div className="progress-copy">
            <strong>{`${discoveredCount} / ${RECIPES.length} 발견`}</strong>
            <span>{`잠긴 레시피 ${RECIPES.length - discoveredCount}종`}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="dex-matrix" aria-label="도감 진행 상황">
          {RECIPES.map((recipe) => (
            <span
              key={recipe.id}
              className={`dex-matrix__cell ${discoveredSet.has(recipe.id) ? "dex-matrix__cell--on" : ""}`}
              title={discoveredSet.has(recipe.id) ? recipe.name : "잠긴 레시피"}
            />
          ))}
        </div>
      </section>

      <section className="panel collection-library">
        <div className="section-heading section-heading--stack">
          <div>
            <p className="eyebrow">레시피 탐색</p>
            <h2>찾아보기 쉬운 도감 목록</h2>
          </div>
          <div className="dex-controls">
            <label>
              희귀도
              <select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value)}>
                <option value="all">전체 희귀도</option>
                {Object.entries(RARITY_META).map(([rarityKey, meta]) => (
                  <option key={rarityKey} value={rarityKey}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              테마
              <select value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value)}>
                <option value="all">전체 테마</option>
                {Object.entries(COLLECTION_META).map(([collectionKey, meta]) => (
                  <option key={collectionKey} value={collectionKey}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="dex-controls__search">
              검색
              <input
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="이름이나 재료로 검색"
              />
            </label>
          </div>
        </div>

        <div className="recipe-list">
          {filteredRecipes.length === 0 ? (
            <div className="empty-card">아직 조건에 맞는 레시피가 없어요. 새로운 컵케이크를 구워 도감을 채워 보세요.</div>
          ) : (
            filteredRecipes.map((recipe) => (
              <article key={recipe.id} className="recipe-card">
                <CupcakeArt recipe={recipe} size="small" />
                <div className="recipe-card__copy">
                  <div className="recipe-card__header">
                    <strong>{recipe.name}</strong>
                    <span className="recipe-card__count">{`제작 ${collection[recipe.id]?.count ?? 0}회`}</span>
                  </div>
                  <p>{recipe.description}</p>
                  <div className="recipe-card__ingredients">
                    {recipe.ingredients.map((ingredient) => (
                      <Tag key={`${recipe.id}-${ingredient.id}`} label={ingredient.name} />
                    ))}
                  </div>
                  <div className="recipe-card__footer">
                    <Tag label={recipe.collectionLabel} />
                    <Tag label={recipe.rarityLabel} bright />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      </div>
    </>
  );
}
