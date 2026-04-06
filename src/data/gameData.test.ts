import { describe, expect, it } from "vitest";
import {
  FALLBACK_INGREDIENT_POOLS,
  FREEFORM_CUPCAKE_RECIPES,
  INGREDIENT_MAP,
  INGREDIENT_UPGRADE_RECIPES,
  getFallbackIngredientPool,
  getFreeformCupcakeRecipe,
  getIngredientUpgradeRecipe,
} from "./gameData";

describe("freeform mixing data", () => {
  it("defines cupcake recipes with 2 to 5 ingredients", () => {
    expect(FREEFORM_CUPCAKE_RECIPES.length).toBeGreaterThan(0);
    expect(
      FREEFORM_CUPCAKE_RECIPES.every(
        (recipe) => recipe.ingredientIds.length >= 2 && recipe.ingredientIds.length <= 5,
      ),
    ).toBe(true);
    expect(FREEFORM_CUPCAKE_RECIPES.some((recipe) => recipe.ingredientIds.length === 2)).toBe(true);
    expect(
      FREEFORM_CUPCAKE_RECIPES.some(
        (recipe) => new Set(recipe.ingredients.map((ingredient) => ingredient.category)).size < recipe.ingredients.length,
      ),
    ).toBe(true);
  });

  it("matches cupcake recipes regardless of ingredient order", () => {
    const recipe = FREEFORM_CUPCAKE_RECIPES.find((entry) => entry.id === "dream-parade-float");
    expect(recipe).toBeDefined();
    expect(getFreeformCupcakeRecipe([...recipe!.ingredientIds].reverse())?.id).toBe(recipe!.id);
  });

  it("defines ingredient upgrade recipes that resolve to ranked result ingredients", () => {
    expect(INGREDIENT_UPGRADE_RECIPES.length).toBeGreaterThan(0);

    const upgrade = getIngredientUpgradeRecipe(["sparkle-sugar", "milk-cloud", "vanilla-cloud"]);
    expect(upgrade?.resultIngredientId).toBe("bunny-marshmallow");
    expect(INGREDIENT_MAP.get(upgrade!.resultIngredientId)?.rank).toBe("refined");
  });

  it("keeps fallback pools aligned with ingredient ranks", () => {
    expect(FALLBACK_INGREDIENT_POOLS).toHaveLength(2);

    for (const pool of FALLBACK_INGREDIENT_POOLS) {
      expect(pool.ingredientIds.length).toBeGreaterThan(0);
      expect(pool.ingredientIds.every((ingredientId) => INGREDIENT_MAP.get(ingredientId)?.rank === pool.rank)).toBe(
        true,
      );
      expect(getFallbackIngredientPool(pool.rank)?.ingredientIds).toEqual(pool.ingredientIds);
    }
  });
});
