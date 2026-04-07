import { describe, expect, it } from "vitest";
import {
  FALLBACK_RESULT_POOLS,
  FREEFORM_RECIPE_PROTOTYPES,
  INGREDIENT_MAP,
  INGREDIENT_UPGRADE_RULES,
  buildMixKey,
  getDominantIngredientRank,
  getFallbackResultPoolForIngredientIds,
  getIngredientUpgradeFromIngredientIds,
  getRecipeFromIngredientIds,
} from "./gameData";

describe("freeform recipe data", () => {
  it("builds order-independent mix keys", () => {
    expect(buildMixKey(["milk-cloud", "vanilla-cloud", "pink-ribbon"])).toBe(
      buildMixKey(["pink-ribbon", "vanilla-cloud", "milk-cloud"]),
    );
  });

  it("keeps the current 4-slot recipe catalog accessible through ingredient arrays", () => {
    const recipe = getRecipeFromIngredientIds([
      "vanilla-cloud",
      "milk-cloud",
      "cherry-bloom",
      "pink-ribbon",
    ]);

    expect(recipe?.id).toBe("vanilla-cloud__milk-cloud__cherry-bloom__pink-ribbon");
    expect(recipe?.ingredientIds).toEqual([
      "vanilla-cloud",
      "milk-cloud",
      "cherry-bloom",
      "pink-ribbon",
    ]);
  });

  it("defines prototype cupcake combos from 2 to 5 ingredients", () => {
    const counts = FREEFORM_RECIPE_PROTOTYPES.map((prototype) => prototype.ingredientIds.length);

    expect(new Set(counts)).toEqual(new Set([2, 3, 4, 5]));
    expect(FREEFORM_RECIPE_PROTOTYPES.every((prototype) => prototype.mixKey === buildMixKey(prototype.ingredientIds))).toBe(
      true,
    );
  });
});

describe("ingredient upgrade data", () => {
  it("matches configured upgrade rules by freeform ingredient set", () => {
    const upgrade = getIngredientUpgradeFromIngredientIds(["sparkle-sugar", "heart-sprinkle"]);

    expect(upgrade?.ingredientId).toBe("stardust");
    expect(upgrade?.resultRank).toBe(2);
  });

  it("stores upgrade rules with normalized keys", () => {
    expect(
      INGREDIENT_UPGRADE_RULES.every((rule) => rule.mixKey === buildMixKey(rule.ingredientIds)),
    ).toBe(true);
  });
});

describe("fallback rank pools", () => {
  it("groups fallback candidates by ingredient rank", () => {
    expect(FALLBACK_RESULT_POOLS[1].ingredientIds.every((ingredientId) => INGREDIENT_MAP.get(ingredientId)?.rank === 1)).toBe(
      true,
    );
    expect(FALLBACK_RESULT_POOLS[2].ingredientIds.every((ingredientId) => INGREDIENT_MAP.get(ingredientId)?.rank === 2)).toBe(
      true,
    );
  });

  it("derives the dominant rank from selected ingredients", () => {
    expect(getDominantIngredientRank(["vanilla-cloud", "milk-cloud", "sparkle-sugar"])).toBe(1);
    expect(getDominantIngredientRank(["matcha-forest", "cream-cheese", "cookie-star"])).toBe(2);
  });

  it("returns a matching fallback pool for a mix", () => {
    const fallback = getFallbackResultPoolForIngredientIds(["vanilla-cloud", "milk-cloud"]);

    expect(fallback.rank).toBe(1);
    expect(fallback.ingredientIds.length).toBeGreaterThan(0);
  });
});
