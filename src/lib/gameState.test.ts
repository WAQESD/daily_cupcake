import { describe, expect, it } from "vitest";
import { normalizeGameState } from "./gameState";

describe("game state normalization", () => {
  it("converts the legacy four-slot selection object into a freeform selection list", () => {
    const state = normalizeGameState(
      {
        selection: {
          batter: "vanilla-cloud",
          cream: "milk-cloud",
          topping: "cherry-bloom",
          finisher: "pink-ribbon",
        },
      },
      0,
    );

    expect(state.selection).toEqual([
      "vanilla-cloud",
      "milk-cloud",
      "cherry-bloom",
      "pink-ribbon",
    ]);
  });

  it("drops invalid ingredient result ids while keeping valid array selections", () => {
    const state = normalizeGameState(
      {
        selection: ["vanilla-cloud", "missing", "milk-cloud"],
        lastCraftedIngredientId: "missing",
      },
      0,
    );

    expect(state.selection).toEqual(["vanilla-cloud", "milk-cloud"]);
    expect(state.lastCraftedIngredientId).toBeNull();
  });
});
