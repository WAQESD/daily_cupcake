import type { CSSProperties } from "react";
import ovenStage from "../../assets/images/oven-stage.png";
import { useShallow } from "zustand/react/shallow";
import { CupcakeArt } from "../components/CupcakeArt";
import { Tag } from "../components/Tag";
import { CATEGORY_META, INGREDIENT_GROUPS, INGREDIENT_MAP, RECIPE_MAP } from "../data/gameData";
import {
  MAX_MIX_SELECTION,
  MIN_MIX_SELECTION,
  canSelectIngredient,
  getCategoryTotal,
  getMixingSelectionPreview,
  getSelectedCount,
  getSelectedIngredientsByCategory,
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
    lastCraftedIngredientId,
    toggleSelection,
    clearSelection,
    craftCupcake,
    toggleFavorite,
  } = useGameStore(
    useShallow((state) => ({
      inventory: state.inventory,
      selection: state.selection,
      discoveredRecipeIds: state.discoveredRecipeIds,
      collection: state.collection,
      favorites: state.favorites,
      craftMessage: state.craftMessage,
      lastCraftedRecipeId: state.lastCraftedRecipeId,
      lastCraftedIngredientId: state.lastCraftedIngredientId,
      toggleSelection: state.toggleSelection,
      clearSelection: state.clearSelection,
      craftCupcake: state.craftCupcake,
      toggleFavorite: state.toggleFavorite,
    })),
  );

  const spotlightIngredients = getTopInventoryIngredients(inventory);
  const selectedIngredients = selection
    .map((ingredientId) => INGREDIENT_MAP.get(ingredientId))
    .filter((ingredient): ingredient is NonNullable<typeof ingredient> => Boolean(ingredient));
  const selectionPreview = getMixingSelectionPreview(selection, discoveredRecipeIds);
  const selectedCount = getSelectedCount(selection);
  const canCraft =
    selectedCount >= MIN_MIX_SELECTION &&
    selectedCount <= MAX_MIX_SELECTION &&
    hasEnoughIngredientsForSelection(inventory, selection);
  const defaultMessage =
    selectedCount < MIN_MIX_SELECTION
      ? `재료를 ${MIN_MIX_SELECTION}개 이상 고르면 자유 조합을 시작할 수 있어요.`
      : selectedCount <= MAX_MIX_SELECTION
        ? selectionPreview.message
        : `재료는 ${MAX_MIX_SELECTION}개까지만 고를 수 있어요.`;

  const lastCraftedRecipe = lastCraftedRecipeId ? RECIPE_MAP.get(lastCraftedRecipeId) ?? null : null;
  const lastCraftedIngredient = lastCraftedIngredientId ? INGREDIENT_MAP.get(lastCraftedIngredientId) ?? null : null;
  const lastCraftedCount = lastCraftedRecipe ? collection[lastCraftedRecipe.id]?.count ?? 0 : 0;
  const isFavorite = lastCraftedRecipe ? favorites.includes(lastCraftedRecipe.id) : false;

  return (
    <section className="workspace panel">
      <div className="section-heading section-heading--stack">
        <div>
          <p className="eyebrow">굽기 공간</p>
          <h2>자유 조합으로 컵케이크 굽기</h2>
        </div>
        <span className="section-heading__note">
          카테고리 고정 슬롯 없이 보유 재료를 2개에서 5개까지 골라 바로 섞어 볼 수 있어요.
        </span>
      </div>

      <div className="workspace__top">
        <article className="soft-panel inventory-panel">
          <div className="subpanel-heading">
            <div>
              <p className="eyebrow">보유 재료</p>
              <h3>지금 쓸 수 있는 재료</h3>
            </div>
            <span className="subpanel-heading__note">
              카테고리별 수량과 자주 쓰는 재료를 먼저 확인해 보세요.
            </span>
          </div>

          <div className="inventory-category-totals">
            {CATEGORY_META.map(({ id, label }) => {
              const availableKinds = INGREDIENT_GROUPS[id].filter(
                (ingredient) => (inventory[ingredient.id] ?? 0) > 0,
              ).length;
              const selectedInCategory = getSelectedIngredientsByCategory(selection, id);

              return (
                <article key={id} className="inventory-total">
                  <span className="inventory-total__label">{label}</span>
                  <strong>{`${getCategoryTotal(inventory, id)}개`}</strong>
                  <span className="inventory-total__sub">
                    {`${availableKinds}종 사용 가능${selectedInCategory.length > 0 ? ` · 선택 ${selectedInCategory.length}개` : ""}`}
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
              <p className="eyebrow">자유 조합</p>
              <h3>오븐 중앙</h3>
            </div>
            <button type="button" className="pixel-button pixel-button--ghost" onClick={clearSelection}>
              선택 비우기
            </button>
          </div>

          <div className="oven-stage__layout">
            <div className="oven-stage__visual">
              <img className="oven-stage__image" src={ovenStage} alt="컵케이크를 굽는 오븐 작업대" />
              <button
                type="button"
                className="pixel-button pixel-button--primary oven-stage__craft"
                onClick={craftCupcake}
                disabled={!canCraft}
              >
                {canCraft
                  ? "선택한 재료로 섞어 굽기"
                  : selectedCount < MIN_MIX_SELECTION
                    ? `재료 ${selectedCount}/${MIN_MIX_SELECTION} 이상 선택`
                    : "선택한 재료 수량이 부족해요"}
              </button>
            </div>

            <div className="oven-stage__info">
              <div className="mix-preview__current">
                <h3>{`현재 조합 (${selectedCount}/${MAX_MIX_SELECTION})`}</h3>
                <div className="selection-grid">
                  {selectedIngredients.length === 0 ? (
                    <article className="selection-card">
                      <span className="selection-card__label">아직 선택 없음</span>
                      <strong>아래 재료 카드에서 2개 이상 골라 주세요</strong>
                      <span className="selection-card__meta">최대 5개까지 자유롭게 섞을 수 있어요.</span>
                    </article>
                  ) : (
                    selectedIngredients.map((ingredient) => {
                      const category = CATEGORY_META.find(({ id }) => id === ingredient.category);
                      return (
                        <article key={ingredient.id} className="selection-card selection-card--filled">
                          <span className="selection-card__label">{category?.label ?? "재료"}</span>
                          <strong>{ingredient.name}</strong>
                          <span className="selection-card__meta">{`${ingredient.short} · ${ingredient.rank === "refined" ? "승급 등급" : "기본 등급"}`}</span>
                        </article>
                      );
                    })
                  )}
                </div>

                <div className="selection-hint">
                  <strong>
                    {selectionPreview.status === "cupcake"
                      ? selectionPreview.alreadyDiscovered
                        ? "이미 발견한 컵케이크 조합"
                        : "새 컵케이크 조합"
                      : selectionPreview.status === "upgrade"
                        ? "재료 승급 조합"
                        : selectionPreview.status === "fallback"
                          ? "랜덤 fallback 조합"
                          : "조합 준비 중"}
                  </strong>
                  <p>{selectionPreview.message}</p>
                </div>

                <p className="mix-preview__message">{craftMessage || defaultMessage}</p>
              </div>

              <div className="mix-preview__result">
                <h3>방금 완성한 결과</h3>
                {lastCraftedRecipe ? (
                  <div className="result-card">
                    <CupcakeArt recipe={lastCraftedRecipe} />
                    <div className="result-card__copy">
                      <div className="result-card__heading">
                        <strong>{lastCraftedRecipe.name}</strong>
                        <button
                          type="button"
                          className="mini-button"
                          onClick={() => toggleFavorite(lastCraftedRecipe.id)}
                        >
                          {isFavorite ? "진열장에서 내리기" : "진열장에 올리기"}
                        </button>
                      </div>
                      <p>{lastCraftedRecipe.description}</p>
                      <div className="result-card__tags">
                        <Tag label={lastCraftedRecipe.collectionLabel} />
                        <Tag label={lastCraftedRecipe.rarityLabel} bright />
                        <Tag label={`제작 ${lastCraftedCount}회`} />
                      </div>
                    </div>
                  </div>
                ) : lastCraftedIngredient ? (
                  <div className="result-card">
                    <div
                      className="selection-card selection-card--filled"
                      style={
                        {
                          "--ingredient-color": lastCraftedIngredient.color,
                          "--ingredient-accent": lastCraftedIngredient.accent,
                        } as CSSProperties
                      }
                    >
                      <span className="selection-card__label">재료 결과</span>
                      <strong>{lastCraftedIngredient.name}</strong>
                      <span className="selection-card__meta">
                        {`${lastCraftedIngredient.rank === "refined" ? "승급 등급" : "기본 등급"} · 인벤토리에 추가됨`}
                      </span>
                    </div>
                    <div className="result-card__copy">
                      <div className="result-card__heading">
                        <strong>{lastCraftedIngredient.name}</strong>
                      </div>
                      <p>
                        정확한 컵케이크 조합은 아니었지만, 이번 자유 조합 결과로 재료를 하나 더 얻었어요.
                      </p>
                      <div className="result-card__tags">
                        <Tag label="재료 결과" />
                        <Tag label={lastCraftedIngredient.rank === "refined" ? "승급 등급" : "기본 등급"} bright />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="result-card result-card--empty">
                    아직 제작 결과가 없어요. 재료를 2개 이상 골라 자유 조합을 시도해 보세요.
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="ingredient-board">
        {CATEGORY_META.map(({ id, label, description }) => {
          const ingredients = INGREDIENT_GROUPS[id];
          const selectedInCategory = getSelectedIngredientsByCategory(selection, id);
          const availableKinds = ingredients.filter((ingredient) => (inventory[ingredient.id] ?? 0) > 0).length;

          return (
            <section key={id} className="ingredient-group">
              <header className="ingredient-group__header">
                <div>
                  <h3>{label}</h3>
                  <p>
                    {selectedInCategory.length > 0
                      ? `${selectedInCategory.map((ingredient) => ingredient.name).join(", ")} 선택 중`
                      : description}
                  </p>
                </div>
                <span className="ingredient-group__status">{`${availableKinds}/${ingredients.length} 준비됨`}</span>
              </header>
              <div className="ingredient-group__grid">
                {ingredients.map((ingredient) => {
                  const amount = inventory[ingredient.id] ?? 0;
                  const selected = selection.includes(ingredient.id);

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
                      onClick={() => toggleSelection(ingredient.id)}
                      aria-pressed={selected}
                      disabled={amount <= 0 || !canSelectIngredient(selection, ingredient.id)}
                    >
                      <span className="ingredient-pill__name">{ingredient.name}</span>
                      <span className="ingredient-pill__meta">
                        {`${ingredient.short} · ${ingredient.rank === "refined" ? "승급" : "기본"}`}
                      </span>
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
