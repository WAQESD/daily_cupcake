import showcaseShelf from "../../assets/images/showcase-shelf.png";
import { CupcakeArt } from "../components/CupcakeArt";
import { Tag } from "../components/Tag";
import { RECIPE_MAP } from "../data/gameData";
import { getRecipePresentation } from "../data/specialCupcakes";
import { useGameStore } from "../store/gameStore";

export function ShowcasePage() {
  const { favorites, collection, toggleFavorite } = useGameStore((state) => ({
    favorites: state.favorites,
    collection: state.collection,
    toggleFavorite: state.toggleFavorite,
  }));

  const favoriteRecipes = favorites
    .map((recipeId) => RECIPE_MAP.get(recipeId))
    .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));

  const craftedRecipes = Object.entries(collection)
    .map(([recipeId, record]) => ({
      recipe: RECIPE_MAP.get(recipeId),
      record,
    }))
    .filter(
      (entry): entry is { recipe: NonNullable<typeof entry.recipe>; record: typeof entry.record } =>
        Boolean(entry.recipe),
    )
    .sort((left, right) => right.record.lastCraftedAt - left.record.lastCraftedAt);

  return (
    <>
      <section className="panel rail-panel">
        <div className="section-heading section-heading--stack">
          <div>
            <p className="eyebrow">전시 공간</p>
            <h2>좋아하는 컵케이크 진열장</h2>
          </div>
          <span className="section-heading__note">즐겨찾기한 컵케이크만 따로 모아서 보여줘요.</span>
        </div>

        <figure className="showcase-scene">
          <img src={showcaseShelf} alt="컵케이크 진열장이 그려진 배경 일러스트" />
        </figure>

        <div className="showcase-list">
          {favoriteRecipes.length === 0 ? (
            <div className="empty-card">마음에 드는 컵케이크를 진열장에 올려 보세요. 방금 만든 결과 카드에서 바로 올릴 수 있어요.</div>
          ) : (
            favoriteRecipes.map((recipe) => {
              const presentation = getRecipePresentation(recipe);

              return (
                <article key={recipe.id} className="showcase-card">
                  <CupcakeArt recipe={recipe} size="small" />
                  <div className="showcase-card__copy">
                    <strong>{presentation.name}</strong>
                    <div className="showcase-card__tags">
                      <Tag label={recipe.rarityLabel} bright />
                      <Tag label={`제작 ${collection[recipe.id]?.count ?? 0}회`} />
                    </div>
                    <button type="button" className="mini-button" onClick={() => toggleFavorite(recipe.id)}>
                      진열장에서 내리기
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="panel crafted-gallery">
        <div className="section-heading section-heading--stack">
          <div>
            <p className="eyebrow">최근 기록</p>
            <h2>최근 만든 컵케이크</h2>
          </div>
          <span className="section-heading__note">방금 만든 결과를 다시 보고 진열장으로 옮길 수 있어요.</span>
        </div>

        <div className="crafted-list">
          {craftedRecipes.length === 0 ? (
            <div className="empty-card">아직 만든 컵케이크가 없어요. 오븐에서 첫 작품을 구워 보세요.</div>
          ) : (
            craftedRecipes.map(({ recipe, record }) => {
              const isFavorite = favorites.includes(recipe.id);
              const presentation = getRecipePresentation(recipe);

              return (
                <article key={recipe.id} className="crafted-card">
                  <CupcakeArt recipe={recipe} size="small" />
                  <div className="crafted-card__copy">
                    <strong>{presentation.name}</strong>
                    <p>{presentation.description}</p>
                    <div className="crafted-card__footer">
                      <Tag label={`보유 ${record.count}개`} />
                      <Tag label={recipe.collectionLabel} />
                      <button type="button" className="mini-button" onClick={() => toggleFavorite(recipe.id)}>
                        {isFavorite ? "내리기" : "올리기"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
