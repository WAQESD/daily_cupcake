import type { CSSProperties } from "react";
import ovenStage from "../../assets/images/oven-stage.png";
import { CupcakeArt } from "../components/CupcakeArt";
import { Tag } from "../components/Tag";
import { CATEGORY_META, INGREDIENT_GROUPS, INGREDIENT_MAP, RECIPES, getRecipeFromSelection } from "../data/gameData";
import { getRecipePresentation } from "../data/specialCupcakes";
import {
  getCategoryTotal,
  getSelectedCount,
  getTopInventoryIngredients,
  hasEnoughIngredientsForSelection,
} from "../lib/gameLogic";
import { useGameStore } from "../store/gameStore";

export function BakeryPage() {
  const {
    inventory,
    selection,
    discoveredRecipeIds,
    collection,
    favorites,
    craftMessage,
    lastCraftedRecipeId,
    toggleSelection,
    clearSelection,
    craftCupcake,
    toggleFavorite,
  } = useGameStore((state) => ({
    inventory: state.inventory,
    selection: state.selection,
    discoveredRecipeIds: state.discoveredRecipeIds,
    collection: state.collection,
    favorites: state.favorites,
    craftMessage: state.craftMessage,
    lastCraftedRecipeId: state.lastCraftedRecipeId,
    toggleSelection: state.toggleSelection,
    clearSelection: state.clearSelection,
    craftCupcake: state.craftCupcake,
    toggleFavorite: state.toggleFavorite,
  }));

  const spotlightIngredients = getTopInventoryIngredients(inventory);
  const selectedRecipe = getRecipeFromSelection(selection);
  const selectedCount = getSelectedCount(selection);
  const canCraft = Boolean(selectedRecipe) && hasEnoughIngredientsForSelection(inventory, selection);
  const defaultMessage =
    selectedCount === CATEGORY_META.length
      ? "모든 재료가 준비됐어요. 중앙 오븐 버튼을 눌러 구워 보세요."
      : `재료 ${selectedCount}/${CATEGORY_META.length} 선택됨`;

  const lastCraftedRecipe = lastCraftedRecipeId
    ? RECIPES.find((recipe) => recipe.id === lastCraftedRecipeId) ?? null
    : null;
  const selectedRecipePresentation = selectedRecipe ? getRecipePresentation(selectedRecipe) : null;
  const lastCraftedRecipePresentation = lastCraftedRecipe ? getRecipePresentation(lastCraftedRecipe) : null;
  const lastCraftedCount = lastCraftedRecipe ? collection[lastCraftedRecipe.id]?.count ?? 0 : 0;
  const isFavorite = lastCraftedRecipe ? favorites.includes(lastCraftedRecipe.id) : false;

  return (
    <section className="workspace panel">
      <div className="section-heading section-heading--stack">
        <div>
          <p className="eyebrow">굽기 공간</p>
          <h2>재료 확인과 컵케이크 굽기</h2>
        </div>
        <span className="section-heading__note">재료 현황을 먼저 보고, 필요한 조합만 골라 바로 굽는 페이지예요.</span>
      </div>

      <div className="workspace__top">
        <article className="soft-panel inventory-panel">
          <div className="subpanel-heading">
            <div>
              <p className="eyebrow">보유 재료</p>
              <h3>지금 쓸 수 있는 재료</h3>
            </div>
            <span className="subpanel-heading__note">카테고리별 총량과 자주 쓰는 재료를 먼저 확인해요.</span>
          </div>

          <div className="inventory-category-totals">
            {CATEGORY_META.map(({ id, label }) => {
              const availableKinds = INGREDIENT_GROUPS[id].filter((ingredient) => (inventory[ingredient.id] ?? 0) > 0).length;
              const selectedIngredient = selection[id] ? INGREDIENT_MAP.get(selection[id] as string) : null;

              return (
                <article key={id} className="inventory-total">
                  <span className="inventory-total__label">{label}</span>
                  <strong>{`${getCategoryTotal(inventory, id)}개`}</strong>
                  <span className="inventory-total__sub">
                    {`${availableKinds}종 사용 가능${selectedIngredient ? ` · ${selectedIngredient.short} 선택` : ""}`}
                  </span>
                </article>
              );
            })}
          </div>

          <div className="inventory-spotlight">
            {spotlightIngredients.length === 0 ? (
              <div className="empty-card">재료가 비어 있어요. 배달 상자를 열어 다시 채워 보세요.</div>
            ) : (
              spotlightIngredients.map((ingredient) => {
                const category = CATEGORY_META.find(({ id }) => id === ingredient.category);
                return (
                  <article key={ingredient.id} className="inventory-chip">
                    <div className="inventory-chip__info">
                      <span className="inventory-chip__name">{ingredient.name}</span>
                      <span className="inventory-chip__meta">{`${category?.label ?? ""} · ${ingredient.short}`}</span>
                    </div>
                    <span className="inventory-chip__count">{`x${inventory[ingredient.id] ?? 0}`}</span>
                  </article>
                );
              })
            )}
          </div>
        </article>

        <article className="soft-panel oven-stage">
          <div className="subpanel-heading">
            <div>
              <p className="eyebrow">조합하기</p>
              <h3>오븐 중앙</h3>
            </div>
            <button type="button" className="pixel-button pixel-button--ghost" onClick={clearSelection}>
              선택 비우기
            </button>
          </div>

          <div className="oven-stage__layout">
            <div className="oven-stage__visual">
              <img className="oven-stage__image" src={ovenStage} alt="컵케이크를 조합하는 작업대 일러스트" />
              <button
                type="button"
                className="pixel-button pixel-button--primary oven-stage__craft"
                onClick={craftCupcake}
                disabled={!canCraft}
              >
                {canCraft
                  ? "선택한 재료로 컵케이크 굽기"
                  : selectedCount < CATEGORY_META.length
                    ? `재료 ${selectedCount}/${CATEGORY_META.length} 선택`
                    : "선택한 재료가 부족해요"}
              </button>
            </div>

            <div className="oven-stage__info">
              <div className="mix-preview__current">
                <h3>현재 조합</h3>
                <div className="selection-grid">
                  {CATEGORY_META.map(({ id, label }) => {
                    const ingredient = selection[id] ? INGREDIENT_MAP.get(selection[id] as string) : null;

                    return (
                      <article key={id} className={`selection-card ${ingredient ? "selection-card--filled" : ""}`}>
                        <span className="selection-card__label">{label}</span>
                        <strong>{ingredient ? ingredient.name : "아직 선택 안 함"}</strong>
                        <span className="selection-card__meta">
                          {ingredient ? `${ingredient.short} 준비 완료` : "아래 재료 카드에서 클릭"}
                        </span>
                      </article>
                    );
                  })}
                </div>

                <div className="selection-hint">
                  {selectedRecipe ? (
                    discoveredRecipeIds.includes(selectedRecipe.id) ? (
                      <>
                        <strong>알고 있는 레시피</strong>
                        <p>{`${selectedRecipePresentation?.name ?? selectedRecipe.name} 조합이에요. 빠르게 다시 만들 수 있어요.`}</p>
                      </>
                    ) : (
                      <>
                        <strong>미지의 레시피</strong>
                        <p>아직 도감에 없는 새로운 컵케이크가 될지도 몰라요.</p>
                      </>
                    )
                  ) : (
                    <>
                      <strong>조합 중</strong>
                      <p>네 종류의 재료를 모두 고르면 오븐 버튼이 활성화돼요.</p>
                    </>
                  )}
                </div>

                <p className="mix-preview__message">{craftMessage || defaultMessage}</p>
              </div>

              <div className="mix-preview__result">
                <h3>방금 완성한 컵케이크</h3>
                {lastCraftedRecipe ? (
                  <div className="result-card">
                    <CupcakeArt recipe={lastCraftedRecipe} />
                    <div className="result-card__copy">
                      <div className="result-card__heading">
                        <strong>{lastCraftedRecipePresentation?.name ?? lastCraftedRecipe.name}</strong>
                        <button
                          type="button"
                          className="mini-button"
                          onClick={() => toggleFavorite(lastCraftedRecipe.id)}
                        >
                          {isFavorite ? "진열장에서 내리기" : "진열장에 올리기"}
                        </button>
                      </div>
                      <p>{lastCraftedRecipePresentation?.description ?? lastCraftedRecipe.description}</p>
                      <div className="result-card__tags">
                        <Tag label={lastCraftedRecipe.collectionLabel} />
                        <Tag label={lastCraftedRecipe.rarityLabel} bright />
                        <Tag label={`제작 ${lastCraftedCount}회`} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="result-card result-card--empty">아직 굽기 결과가 없어요.</div>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="ingredient-board">
        {CATEGORY_META.map(({ id, label, description }) => {
          const ingredients = INGREDIENT_GROUPS[id];
          const selectedIngredient = selection[id] ? INGREDIENT_MAP.get(selection[id] as string) : null;
          const availableKinds = ingredients.filter((ingredient) => (inventory[ingredient.id] ?? 0) > 0).length;

          return (
            <section key={id} className="ingredient-group">
              <header className="ingredient-group__header">
                <div>
                  <h3>{label}</h3>
                  <p>{selectedIngredient ? `${selectedIngredient.name} 선택 중` : description}</p>
                </div>
                <span className="ingredient-group__status">{`${availableKinds}/${ingredients.length} 준비됨`}</span>
              </header>
              <div className="ingredient-group__grid">
                {ingredients.map((ingredient) => {
                  const amount = inventory[ingredient.id] ?? 0;
                  const selected = selection[id] === ingredient.id;

                  return (
                    <button
                      key={ingredient.id}
                      type="button"
                      className={`ingredient-pill ${selected ? "ingredient-pill--selected" : ""}`}
                      style={
                        {
                          "--ingredient-color": ingredient.color,
                          "--ingredient-accent": ingredient.accent,
                        } as CSSProperties
                      }
                      onClick={() => toggleSelection(id, ingredient.id)}
                      aria-pressed={selected}
                      disabled={amount <= 0}
                    >
                      <span className="ingredient-pill__name">{ingredient.name}</span>
                      <span className="ingredient-pill__meta">{ingredient.short}</span>
                      <span className="ingredient-pill__count">{`보유 ${amount}`}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
