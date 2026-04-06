import type { CSSProperties } from "react";
import ovenStage from "../../assets/images/oven-stage.png";
import { useShallow } from "zustand/react/shallow";
import { CupcakeArt } from "../components/CupcakeArt";
import { Tag } from "../components/Tag";
import { CATEGORY_META, INGREDIENT_GROUPS, INGREDIENT_MAP, RECIPES, getRecipeFromSelection } from "../data/gameData";
import {
  getCategoryTotal,
  getCraftedRecipePreview,
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
  } = useGameStore(
    useShallow((state) => ({
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
    })),
  );

  const spotlightIngredients = getTopInventoryIngredients(inventory);
  const selectedRecipe = getRecipeFromSelection(selection);
  const craftedSelectionPreview = getCraftedRecipePreview(selection, collection);
  const selectedCount = getSelectedCount(selection);
  const canCraft = Boolean(selectedRecipe) && hasEnoughIngredientsForSelection(inventory, selection);
  const defaultMessage =
    selectedCount === CATEGORY_META.length
      ? "紐⑤뱺 ?щ즺媛 以鍮꾨릱?댁슂. 以묒븰 援쎄린 踰꾪듉???뚮윭 而듭??댄겕瑜?援ъ썙 蹂댁꽭??"
      : `?щ즺 ${selectedCount}/${CATEGORY_META.length} ?좏깮 以묒씠?먯슂.`;

  const lastCraftedRecipe = lastCraftedRecipeId
    ? RECIPES.find((recipe) => recipe.id === lastCraftedRecipeId) ?? null
    : null;
  const displayedRecipe = craftedSelectionPreview?.recipe ?? lastCraftedRecipe;
  const displayedRecipeCount =
    craftedSelectionPreview?.record.count ??
    (lastCraftedRecipe ? collection[lastCraftedRecipe.id]?.count ?? 0 : 0);
  const isPreviewingKnownRecipe = Boolean(craftedSelectionPreview);
  const isFavorite = displayedRecipe ? favorites.includes(displayedRecipe.id) : false;

  return (
    <section className="workspace panel">
      <div className="section-heading section-heading--stack">
        <div>
          <p className="eyebrow">援쎄린 怨듦컙</p>
          <h2>?щ즺 ?뺤씤怨?而듭??댄겕 援쎄린</h2>
        </div>
        <span className="section-heading__note">
          蹂댁쑀 ?щ즺瑜??뺤씤?섍퀬, ?꾩슂??議고빀留?怨⑤씪 諛붾줈 援쎈뒗 ?섏씠吏?덉슂.
        </span>
      </div>

      <div className="workspace__top">
        <article className="soft-panel inventory-panel">
          <div className="subpanel-heading">
            <div>
              <p className="eyebrow">蹂댁쑀 ?щ즺</p>
              <h3>吏湲??????덈뒗 ?щ즺</h3>
            </div>
            <span className="subpanel-heading__note">
              移댄뀒怨좊━蹂??섎웾怨??먯＜ ?곕뒗 ?щ즺瑜?癒쇱? ?뺤씤??蹂댁꽭??
            </span>
          </div>

          <div className="inventory-category-totals">
            {CATEGORY_META.map(({ id, label }) => {
              const availableKinds = INGREDIENT_GROUPS[id].filter(
                (ingredient) => (inventory[ingredient.id] ?? 0) > 0,
              ).length;
              const selectedIngredient = selection[id] ? INGREDIENT_MAP.get(selection[id] as string) : null;

              return (
                <article key={id} className="inventory-total">
                  <span className="inventory-total__label">{label}</span>
                  <strong>{`${getCategoryTotal(inventory, id)}媛?}</strong>
                  <span className="inventory-total__sub">
                    {`${availableKinds}醫??ъ슜 媛??{selectedIngredient ? ` 쨌 ${selectedIngredient.short} ?좏깮` : ""}`}
                  </span>
                </article>
              );
            })}
          </div>

          <div className="inventory-spotlight">
            {spotlightIngredients.length === 0 ? (
              <div className="empty-card">?щ즺媛 鍮꾩뼱 ?덉뼱?? 諛곕떖 ?곸옄瑜??댁뼱 ?ㅼ떆 梨꾩썙 蹂댁꽭??</div>
            ) : (
              spotlightIngredients.map((ingredient) => {
                const category = CATEGORY_META.find(({ id }) => id === ingredient.category);
                return (
                  <article key={ingredient.id} className="inventory-chip">
                    <div className="inventory-chip__info">
                      <span className="inventory-chip__name">{ingredient.name}</span>
                      <span className="inventory-chip__meta">{`${category?.label ?? ""} 쨌 ${ingredient.short}`}</span>
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
              <p className="eyebrow">議고빀?섍린</p>
              <h3>?ㅻ툙 以묒븰</h3>
            </div>
            <button type="button" className="pixel-button pixel-button--ghost" onClick={clearSelection}>
              ?좏깮 鍮꾩슦湲?            </button>
          </div>

          <div className="oven-stage__layout">
            <div className="oven-stage__visual">
              <img className="oven-stage__image" src={ovenStage} alt="而듭??댄겕瑜?援쎈뒗 ?ㅻ툙 ?묒뾽?" />
              <button
                type="button"
                className="pixel-button pixel-button--primary oven-stage__craft"
                onClick={craftCupcake}
                disabled={!canCraft}
              >
                {canCraft
                  ? "?좏깮???щ즺濡?而듭??댄겕 援쎄린"
                  : selectedCount < CATEGORY_META.length
                    ? `?щ즺 ${selectedCount}/${CATEGORY_META.length} ?좏깮`
                    : "?좏깮???щ즺媛 遺議깊빐??}
              </button>
            </div>

            <div className="oven-stage__info">
              <div className="mix-preview__current">
                <h3>?꾩옱 議고빀</h3>
                <div className="selection-grid">
                  {CATEGORY_META.map(({ id, label }) => {
                    const ingredient = selection[id] ? INGREDIENT_MAP.get(selection[id] as string) : null;

                    return (
                      <article key={id} className={`selection-card ${ingredient ? "selection-card--filled" : ""}`}>
                        <span className="selection-card__label">{label}</span>
                        <strong>{ingredient ? ingredient.name : "?꾩쭅 ?좏깮 ????}</strong>
                        <span className="selection-card__meta">
                          {ingredient ? `${ingredient.short} 以鍮??꾨즺` : "?꾨옒 ?щ즺 移대뱶?먯꽌 ?좏깮??二쇱꽭??}
                        </span>
                      </article>
                    );
                  })}
                </div>

                <div className="selection-hint">
                  {isPreviewingKnownRecipe && selectedRecipe ? (
                    <>
                      <strong>?대? ?쒕룄???뺥솗??議고빀</strong>
                      <p>
                        {`${selectedRecipe.name} 議고빀? ?댁쟾??${craftedSelectionPreview?.record.count ?? 0}???깃났?덉뼱?? ?꾨옒 寃곌낵 移대뱶?먯꽌 諛붾줈 ?ㅼ떆 ?뺤씤?????덉뼱??`}
                      </p>
                    </>
                  ) : selectedRecipe ? (
                    discoveredRecipeIds.includes(selectedRecipe.id) ? (
                      <>
                        <strong>?대? 諛쒓껄???덉떆??/strong>
                        <p>
                          {`${selectedRecipe.name} 議고빀? ?대? 諛쒓껄?덉?留? 吏湲?怨좊Ⅸ ?뺥솗??4?щ즺???꾩쭅 ?깃났 湲곕줉???놁쓣 ?섎룄 ?덉뼱??`}
                        </p>
                      </>
                    ) : (
                      <>
                        <strong>?꾩쭅 留뚮뱾吏 ?딆? 議고빀</strong>
                        <p>???뺥솗??4?щ즺 議고빀? ?꾩쭅 ?깃났 湲곕줉???놁뼱?? 援쎄린 ?꾧퉴吏??誘명솗???곹깭濡??⑥븘??</p>
                      </>
                    )
                  ) : (
                    <>
                      <strong>議고빀 以?/strong>
                      <p>4醫낅쪟 ?щ즺瑜?紐⑤몢 怨좊Ⅴ硫?寃곌낵 ?곸뿭?먯꽌 ?대? 留뚮뱺 議고빀?몄? 諛붾줈 ?뺤씤?????덉뼱??</p>
                    </>
                  )}
                </div>

                <p className="mix-preview__message">{craftMessage || defaultMessage}</p>
              </div>

              <div className="mix-preview__result">
                <h3>{isPreviewingKnownRecipe ? "?대? 留뚮뱺 寃곌낵 誘몃━蹂닿린" : "諛⑷툑 ?꾩꽦??而듭??댄겕"}</h3>
                {displayedRecipe ? (
                  <div className={`result-card ${isPreviewingKnownRecipe ? "result-card--known-selection" : ""}`}>
                    <CupcakeArt recipe={displayedRecipe} />
                    <div className="result-card__copy">
                      <div className="result-card__heading">
                        <strong>{displayedRecipe.name}</strong>
                        <button
                          type="button"
                          className="mini-button"
                          onClick={() => toggleFavorite(displayedRecipe.id)}
                        >
                          {isFavorite ? "吏꾩뿴?μ뿉???대━湲? : "吏꾩뿴?μ뿉 ?щ━湲?}
                        </button>
                      </div>
                      <div className="result-card__tags">
                        {isPreviewingKnownRecipe ? <Tag label="?대? 留뚮뱺 寃곌낵" bright /> : null}
                        <Tag label={displayedRecipe.collectionLabel} />
                        <Tag label={displayedRecipe.rarityLabel} bright />
                        <Tag label={`?쒖옉 ${displayedRecipeCount}??} />
                      </div>
                      <p>
                        {isPreviewingKnownRecipe
                          ? `${displayedRecipe.description} ???뺥솗??議고빀? ?덈줈怨좎묠 ?ㅼ뿉??媛숈? 湲곕줉?쇰줈 ?ㅼ떆 ?뺤씤?????덉뼱??`
                          : displayedRecipe.description}
                      </p>
                      <div className="result-card__tags">
                        <Tag label={isPreviewingKnownRecipe ? "?꾩옱 ?좏깮怨??쇱튂" : "媛??理쒓렐 寃곌낵"} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="result-card result-card--empty">
                    ?꾩쭅 援쎄린 寃곌낵媛 ?놁뼱?? ?뺥솗??4?щ즺瑜?紐⑤몢 怨좊Ⅴ硫??대? 留뚮뱺 議고빀?몄? 癒쇱? 蹂댁뿬?쒕┫寃뚯슂.
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
          const selectedIngredient = selection[id] ? INGREDIENT_MAP.get(selection[id] as string) : null;
          const availableKinds = ingredients.filter((ingredient) => (inventory[ingredient.id] ?? 0) > 0).length;

          return (
            <section key={id} className="ingredient-group">
              <header className="ingredient-group__header">
                <div>
                  <h3>{label}</h3>
                  <p>{selectedIngredient ? `${selectedIngredient.name} ?좏깮 以? : description}</p>
                </div>
                <span className="ingredient-group__status">{`${availableKinds}/${ingredients.length} 以鍮꾨맖`}</span>
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
                      <span className="ingredient-pill__count">{`蹂댁쑀 ${amount}`}</span>
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
