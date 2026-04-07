import { describe, expect, it } from "vitest";
import { RECIPES } from "../data/gameData";
import { createInitialGameState, exportGameState, importGameState, normalizeGameState } from "./gameState";

describe("save transfer", () => {
  it("round-trips an exported save with the latest mix result", async () => {
    const recipeId = RECIPES[0].id;
    const state = createInitialGameState(123);

    state.pendingBoxes = 1;
    state.lastDeliveryResolvedAt = 456;
    state.lastDailyClaimDate = "2026-04-07";
    state.dailyStreak = 3;
    state.lastDailyChallengeDate = "2026-04-06";
    state.lastCraftedRecipeId = recipeId;
    state.lastMixResult = { type: "cupcake", recipeId };
    state.selection = ["vanilla-cloud", "milk-cloud"];
    state.discoveredRecipeIds = [recipeId];
    state.favorites = [recipeId];
    state.collection[recipeId] = {
      count: 2,
      firstCraftedAt: 111,
      lastCraftedAt: 222,
    };

    const exported = await exportGameState(state);
    const imported = await importGameState(exported, 999);

    expect(imported).toEqual(normalizeGameState(state, 999));
  });

  it("migrates legacy slot selection objects into freeform selections", () => {
    const state = normalizeGameState(
      {
        inventory: {},
        selection: {
          batter: "vanilla-cloud",
          cream: "milk-cloud",
          topping: "cherry-bloom",
          finisher: "pink-ribbon",
        },
        discoveredRecipeIds: [],
        collection: {},
        favorites: [],
        pendingBoxes: 0,
        lastDeliveryResolvedAt: 0,
        lastDailyClaimDate: "",
        dailyStreak: 0,
        lastDailyChallengeDate: "",
        lastCraftedRecipeId: null,
      },
      0,
    );

    expect(state.selection).toEqual(["vanilla-cloud", "milk-cloud", "cherry-bloom", "pink-ribbon"]);
  });

  it("rejects malformed transfer strings", async () => {
    await expect(importGameState("daily-cupcake-save:1:not-valid")).rejects.toThrow();
  });
});
