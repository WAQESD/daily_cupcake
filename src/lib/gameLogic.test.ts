import { describe, expect, it } from "vitest";
import { DELIVERY_MS, MAX_PENDING_BOXES } from "../config/game";
import { RECIPES, getDailyRecipe, getRecipeFromSelection } from "../data/gameData";
import { getCraftedRecipePreview, synchronizePendingBoxes } from "./gameLogic";
import { createInitialGameState, normalizeGameState } from "./gameState";

describe("game bootstrap", () => {
  it("seeds starter ingredients for a new save", () => {
    const state = createInitialGameState(0);

    expect(state.inventory["vanilla-cloud"]).toBe(2);
    expect(state.inventory["milk-cloud"]).toBe(2);
    expect(state.inventory["strawberry-fairy"]).toBe(1);
  });

  it("normalizes broken saves without exceeding caps", () => {
    const state = normalizeGameState(
      {
        pendingBoxes: 999,
        discoveredRecipeIds: [RECIPES[0].id, "missing"],
        favorites: [RECIPES[0].id, "missing"],
      },
      0,
    );

    expect(state.pendingBoxes).toBe(MAX_PENDING_BOXES);
    expect(state.discoveredRecipeIds).toEqual([RECIPES[0].id]);
    expect(state.favorites).toEqual([RECIPES[0].id]);
  });
});

describe("recipes", () => {
  it("resolves a recipe from the selected ingredients", () => {
    const recipe = getRecipeFromSelection({
      batter: "vanilla-cloud",
      cream: "milk-cloud",
      topping: "cherry-bloom",
      finisher: "pink-ribbon",
    });

    expect(recipe?.id).toBe("vanilla-cloud__milk-cloud__cherry-bloom__pink-ribbon");
  });

  it("picks the same daily recipe for the same day", () => {
    expect(getDailyRecipe("2026-04-07").id).toBe(getDailyRecipe("2026-04-07").id);
  });

  it("returns a preview for an exact crafted combination", () => {
    const selection = {
      batter: "vanilla-cloud",
      cream: "milk-cloud",
      topping: "cherry-bloom",
      finisher: "pink-ribbon",
    } as const;
    const preview = getCraftedRecipePreview(selection, {
      "vanilla-cloud__milk-cloud__cherry-bloom__pink-ribbon": {
        count: 3,
        firstCraftedAt: 100,
        lastCraftedAt: 200,
      },
    });

    expect(preview?.recipe.id).toBe("vanilla-cloud__milk-cloud__cherry-bloom__pink-ribbon");
    expect(preview?.record.count).toBe(3);
  });

  it("does not return a preview for an uncrafted combination", () => {
    const preview = getCraftedRecipePreview(
      {
        batter: "vanilla-cloud",
        cream: "milk-cloud",
        topping: "cherry-bloom",
        finisher: "pink-ribbon",
      },
      {},
    );

    expect(preview).toBeNull();
  });
});

describe("deliveries", () => {
  it("adds pending boxes when enough time passes", () => {
    const state = createInitialGameState(0);
    state.pendingBoxes = 0;
    state.lastDeliveryResolvedAt = 0;

    const synced = synchronizePendingBoxes(state, DELIVERY_MS * 3 + 1);

    expect(synced.pendingBoxes).toBe(3);
    expect(synced.lastDeliveryResolvedAt).toBe(DELIVERY_MS * 3);
  });
});
