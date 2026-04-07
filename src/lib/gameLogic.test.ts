import { describe, expect, it, vi } from "vitest";
import { DELIVERY_MS, MAX_PENDING_BOXES } from "../config/game";
import { RECIPES, getDailyRecipe, getRecipeFromSelection } from "../data/gameData";
import { getCraftPreview, getCraftedRecipePreview, resolveCraftResult, synchronizePendingBoxes } from "./gameLogic";
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

describe("freeform crafting", () => {
  it("resolves a freeform cupcake recipe regardless of ingredient order", () => {
    const recipe = getRecipeFromSelection(["pink-ribbon", "strawberry-butter", "cherry-bloom", "strawberry-fairy"]);

    expect(recipe?.id).toBe("berry-ribbon-party");
  });

  it("returns a preview for an exact crafted combination", () => {
    const preview = getCraftedRecipePreview(["milk-cloud", "vanilla-cloud"], {
      "cloud-blanket-shortcake": {
        count: 3,
        firstCraftedAt: 100,
        lastCraftedAt: 200,
      },
    });

    expect(preview?.recipe.id).toBe("cloud-blanket-shortcake");
    expect(preview?.record.count).toBe(3);
  });

  it("shows an upgrade preview when the selection matches a rank-up recipe", () => {
    const preview = getCraftPreview(["sparkle-sugar", "milk-cloud", "vanilla-cloud"], {});

    expect(preview.kind).toBe("upgrade");
    if (preview.kind === "upgrade") {
      expect(preview.ingredient.id).toBe("bunny-marshmallow");
    }
  });

  it("returns a refined fallback ingredient when refined ingredients are mixed without a recipe", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    try {
      const result = resolveCraftResult(["matcha-forest", "heart-sprinkle"]);
      expect(result?.type).toBe("ingredient");
      if (result?.type === "ingredient") {
        expect(result.rank).toBe("refined");
        expect(result.ingredient.rank).toBe("refined");
      }
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("picks the same daily recipe for the same day", () => {
    expect(getDailyRecipe("2026-04-07").id).toBe(getDailyRecipe("2026-04-07").id);
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
