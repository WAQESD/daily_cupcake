import type { CSSProperties } from "react";
import ovenStage from "../../assets/images/oven-stage.png";
import { useShallow } from "zustand/react/shallow";
import { CupcakeArt } from "../components/CupcakeArt";
import { Tag } from "../components/Tag";
import {
  CATEGORY_META,
  INGREDIENT_GROUPS,
  INGREDIENT_MAP,
  INGREDIENT_RANK_META,
  RECIPE_MAP,
} from "../data/gameData";
import {
  getCategoryTotal,
  getCraftPreview,
  getSelectedCategoryCount,
  getSelectedCount,
  getTopInventoryIngredients,
  hasEnoughIngredientsForSelection,
} from "../lib/gameLogic";
import { useGameStore } from "../store/gameStore";

export function BakeryPage() {
  const {
    inventory,
    selection,
    craftMessage,
    collection,
    favorites,
    lastMixResult,
    toggleSelection,
    clearSelection,
    craftCupcake,
    toggleFavorite,
  } = useGameStore(
    useShallow((state) => ({
      inventory: state.inventory,
      selection: state.selection,
      craftMessage: state.craftMessage,
      collection: state.collection,
      favorites: state.favorites,
      lastMixResult: state.lastMixResult,
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
  const selectedCount = getSelectedCount(selection);
  const selectedCategoryCount = getSelectedCategoryCount(selection);
  const preview = getCraftPreview(selection, collection);
  const canCraft =
    selectedCount >= 2 && selectedCount <= 5 && hasEnoughIngredientsForSelection(inventory, selection);

  const lastCupcake =
    lastMixResult?.type === "cupcake" ? RECIPE_MAP.get(lastMixResult.recipeId) ?? null : null;
  const lastIngredientResult = lastMixResult?.type === "ingredient" ? lastMixResult : null;
  const lastIngredient =
    lastIngredientResult ? INGREDIENT_MAP.get(lastIngredientResult.ingredientId) ?? null : null;
  const previewFavorite = preview.kind === "cupcake" ? favorites.includes(preview.recipe.id) : false;
  const lastCupcakeFavorite = lastCupcake ? favorites.includes(lastCupcake.id) : false;

  const defaultMessage =
    preview.kind === "empty"
      ? preview.message
      : preview.kind === "invalid"
        ? preview.message
        : preview.kind === "cupcake"
          ? preview.record
            ? `${preview.recipe.name} 조합은 이미 ${preview.record.count}번 성공했어요. 다시 굽거나 진열장에 올릴 수 있어요.`
            : `${preview.recipe.name}는 아직 발견하지 못한 자유 조합 컵케이크예요.`
          : preview.kind === "upgrade"
            ? `${preview.ingredient.name} 재료로 승급되는 조합이에요.`
            : `${INGREDIENT_RANK_META[preview.rank].label} 재료 후보군에서 랜덤 결과가 나와요.`;

  function renderIngredientCard(
    title: string,
    ingredient: NonNullable<typeof lastIngredient>,
    description: string,
    tags: string[],
  ) {
    return (
      <div
        className="ingredient-result-card"
        style={
          {
            "--ingredient-color": ingredient.color,
            "--ingredient-accent": ingredient.accent,
          } as CSSProperties
        }
      >
        <div className="ingredient-result-card__copy">
          <div className="section-heading">
            <strong>{title}</strong>
            <Tag label={INGREDIENT_RANK_META[ingredient.rank].label} bright />
          </div>
          <p className="ingredient-result-card__name">{ingredient.name}</p>
          <p>{description}</p>
          <div className="result-card__tags">
            {tags.map((tag) => (
              <Tag key={`${ingredient.id}-${tag}`} label={tag} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="workspace panel">
      <div className="section-heading section-heading--stack">
        <div>
          <p className="eyebrow">굽기 공간</p>
          <h2>2개에서 5개까지 자유롭게 섞기</h2>
        </div>
        <span className="section-heading__note">
          기존 고정 슬롯 대신 원하는 재료를 2~5개까지 골라 하나의 조합으로 만들어요. 같은 재료는 한 번씩만
          선택할 수 있어요.
        </span>
      </div>

      <div className="workspace__top">
        <article className="soft-panel inventory-panel">
          <div className="subpanel-heading">
            <div>
              <p className="eyebrow">보유 재료</p>
              <h3>지금 조합에 넣을 수 있는 재료</h3>
            </div>
            <span className="subpanel-heading__note">
              카테고리별 총량을 확인하고, 아래 보드에서 자유롭게 여러 재료를 골라 보세요.
            </span>
          </div>

          <div className="inventory-category-totals">
            {CATEGORY_META.map(({ id, label }) => {
              const availableKinds = INGREDIENT_GROUPS[id].filter((ingredient) => (inventory[ingredient.id] ?? 0) > 0)
                .length;

              return (
                <article key={id} className="inventory-total">
                  <span className="inventory-total__label">{label}</span>
                  <strong>{`${getCategoryTotal(inventory, id)}개`}</strong>
                  <span className="inventory-total__sub">{`${availableKinds}종 사용 가능`}</span>
                </article>
              );
            })}
          </div>

          <div className="inventory-spotlight">
            {spotlightIngredients.length === 0 ? (
              <div className="empty-card">재료가 비어 있어요. 선물함에서 상자를 열어 다시 채워 보세요.</div>
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
                  ? `선택한 ${selectedCount}개 재료로 조합하기`
                  : selectedCount < 2
                    ? `재료 ${selectedCount}/2+ 선택`
                    : "선택한 재료 수량이 부족해요"}
              </button>
            </div>

            <div className="oven-stage__info">
              <div className="mix-preview__current">
                <div className="section-heading">
                  <h3>현재 선택</h3>
                  <div className="result-card__tags">
                    <Tag label={`재료 ${selectedCount}/5`} bright />
                    <Tag label={`카테고리 ${selectedCategoryCount}/4`} />
                  </div>
                </div>

                {selectedIngredients.length === 0 ? (
                  <div className="empty-card">아래 재료 카드에서 원하는 재료를 눌러 자유 조합을 시작해 보세요.</div>
                ) : (
                  <div className="selection-basket">
                    {selectedIngredients.map((ingredient) => (
                      <button
                        key={ingredient.id}
                        type="button"
                        className="selection-token"
                        style={
                          {
                            "--ingredient-color": ingredient.color,
                            "--ingredient-accent": ingredient.accent,
                          } as CSSProperties
                        }
                        onClick={() => toggleSelection(ingredient.id)}
                      >
                        <span className="selection-token__name">{ingredient.name}</span>
                        <span className="selection-token__meta">{`${ingredient.short} · 선택 해제`}</span>
                      </button>
                    ))}
                  </div>
                )}

                <p className="mix-preview__message">{craftMessage || defaultMessage}</p>
              </div>

              <div className="mix-preview__result">
                <h3>예상 결과</h3>
                {preview.kind === "cupcake" ? (
                  <div className="result-card">
                    <CupcakeArt recipe={preview.recipe} />
                    <div className="result-card__copy">
                      <div className="result-card__heading">
                        <strong>{preview.recipe.name}</strong>
                        {preview.record ? (
                          <button
                            type="button"
                            className="mini-button"
                            onClick={() => toggleFavorite(preview.recipe.id)}
                          >
                            {previewFavorite ? "진열장에서 내리기" : "진열장에 올리기"}
                          </button>
                        ) : null}
                      </div>
                      <p>{preview.recipe.description}</p>
                      <div className="result-card__tags">
                        <Tag label={preview.recipe.collectionLabel} />
                        <Tag label={preview.recipe.rarityLabel} bright />
                        <Tag label={preview.record ? `이미 제작 ${preview.record.count}회` : "새 자유 조합"} />
                      </div>
                    </div>
                  </div>
                ) : preview.kind === "upgrade" ? (
                  renderIngredientCard(
                    "재료 승급 예상",
                    preview.ingredient,
                    preview.recipe.note,
                    ["상위 재료", `결과 ${preview.ingredient.name}`],
                  )
                ) : preview.kind === "fallback" ? (
                  <div className="ingredient-result-card ingredient-result-card--fallback">
                    <div className="ingredient-result-card__copy">
                      <div className="section-heading">
                        <strong>랜덤 재료 결과</strong>
                        <Tag label={INGREDIENT_RANK_META[preview.rank].label} bright />
                      </div>
                      <p>
                        정의된 컵케이크나 승급 조합이 아니어서 {preview.poolSize}종의 {INGREDIENT_RANK_META[preview.rank].label}
                        후보군 중 하나가 나와요.
                      </p>
                      <p className="ingredient-result-card__note">{preview.note}</p>
                    </div>
                  </div>
                ) : (
                  <div className="result-card result-card--empty">{preview.message}</div>
                )}
              </div>

              <div className="mix-preview__result">
                <h3>가장 최근 결과</h3>
                {lastCupcake ? (
                  <div className="result-card">
                    <CupcakeArt recipe={lastCupcake} />
                    <div className="result-card__copy">
                      <div className="result-card__heading">
                        <strong>{lastCupcake.name}</strong>
                        <button
                          type="button"
                          className="mini-button"
                          onClick={() => toggleFavorite(lastCupcake.id)}
                        >
                          {lastCupcakeFavorite ? "진열장에서 내리기" : "진열장에 올리기"}
                        </button>
                      </div>
                      <p>{lastCupcake.description}</p>
                      <div className="result-card__tags">
                        <Tag label={lastCupcake.collectionLabel} />
                        <Tag label={lastCupcake.rarityLabel} bright />
                        <Tag label={`제작 ${collection[lastCupcake.id]?.count ?? 0}회`} />
                      </div>
                    </div>
                  </div>
                ) : lastIngredient ? (
                  renderIngredientCard(
                    lastIngredientResult?.source === "upgrade" ? "최근 승급 결과" : "최근 랜덤 결과",
                    lastIngredient,
                    lastIngredientResult?.source === "upgrade"
                      ? "정의된 승급 조합으로 얻은 상위 재료예요."
                      : "정의되지 않은 조합에서 같은 등급 후보군으로 굴린 결과예요.",
                    [lastIngredientResult?.source === "upgrade" ? "승급 성공" : "랜덤 fallback", lastIngredient.short],
                  )
                ) : (
                  <div className="result-card result-card--empty">아직 만든 결과가 없어요. 첫 자유 조합을 시도해 보세요.</div>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className="ingredient-board">
        {CATEGORY_META.map(({ id, label, description }) => {
          const ingredients = INGREDIENT_GROUPS[id];
          const availableKinds = ingredients.filter((ingredient) => (inventory[ingredient.id] ?? 0) > 0).length;

          return (
            <section key={id} className="ingredient-group">
              <header className="ingredient-group__header">
                <div>
                  <h3>{label}</h3>
                  <p>{description}</p>
                </div>
                <span className="ingredient-group__status">{`${availableKinds}/${ingredients.length} 준비됨`}</span>
              </header>
              <div className="ingredient-group__grid">
                {ingredients.map((ingredient) => {
                  const amount = inventory[ingredient.id] ?? 0;
                  const selected = selection.includes(ingredient.id);
                  const maxedOut = selection.length >= 5 && !selected;

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
                      disabled={amount <= 0 || maxedOut}
                    >
                      <span className="ingredient-pill__name">{ingredient.name}</span>
                      <span className="ingredient-pill__meta">
                        {`${ingredient.short} · ${INGREDIENT_RANK_META[ingredient.rank].label}`}
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
