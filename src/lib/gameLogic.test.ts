import { afterEach, describe, expect, it, vi } from "vitest";
import { DELIVERY_MS, MAX_PENDING_BOXES } from "../config/game";
import { RECIPES, getDailyRecipe } from "../data/gameData";
import {
  getMixingSelectionPreview,
  hasEnoughIngredientsForSelection,
  resolveCraftSelection,
  synchronizePendingBoxes,
} from "./gameLogic";
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a cupcake preview for an exact freeform recipe", () => {
    const preview = getMixingSelectionPreview(["vanilla-cloud", "milk-cloud"]);

    expect(preview.status).toBe("cupcake");
    expect(preview.recipe?.id).toBe("cloud-blanket-shortcake");
  });

  it("returns an upgrade preview for an ingredient upgrade recipe", () => {
    const preview = getMixingSelectionPreview(["vanilla-cloud", "milk-cloud", "sparkle-sugar"]);

    expect(preview.status).toBe("upgrade");
    expect(preview.ingredient?.id).toBe("bunny-marshmallow");
  });

  it("resolves a fallback ingredient from the refined pool when refined ingredients are mixed", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = resolveCraftSelection(
      {
        "matcha-forest": 1,
        "milk-cloud": 1,
      },
      ["matcha-forest", "milk-cloud"],
    );

    expect(result.type).toBe("ingredient");
    if (result.type !== "ingredient") {
      throw new Error("Expected ingredient result");
    }
    expect(result.source).toBe("fallback");
    expect(result.rank).toBe("refined");
    expect(result.ingredient.rank).toBe("refined");
  });

  it("counts repeated ingredients against inventory quantity", () => {
    expect(
      hasEnoughIngredientsForSelection(
        {
          "vanilla-cloud": 1,
        },
        ["vanilla-cloud", "vanilla-cloud"],
      ),
    ).toBe(false);
  });
});

describe("recipes", () => {
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
