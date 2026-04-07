import { DAILY_TIMEZONE, DELIVERY_MS, MAX_PENDING_BOXES } from "../config/game";
import {
  ALL_INGREDIENTS,
  CATEGORY_META,
  INGREDIENT_GROUPS,
  INGREDIENT_MAP,
  INGREDIENT_RANK_META,
  getFallbackIngredientPool,
  getFreeformCupcakeRecipe,
  getHighestIngredientRank,
  getIngredientUpgradeRecipe,
  getRecipeFromSelection,
} from "../data/gameData";
import type {
  CategoryId,
  CraftResult,
  GameState,
  Ingredient,
  IngredientRank,
  IngredientUpgradeRecipe,
  Inventory,
  Recipe,
  RecipeCollectionRecord,
  Selection,
} from "../types/game";
import { cloneGameState } from "./gameState";

export type CraftPreview =
  | {
      kind: "empty";
      message: string;
    }
  | {
      kind: "invalid";
      message: string;
    }
  | {
      kind: "cupcake";
      recipe: Recipe;
      record: RecipeCollectionRecord | null;
    }
  | {
      kind: "upgrade";
      ingredient: Ingredient;
      recipe: IngredientUpgradeRecipe;
    }
  | {
      kind: "fallback";
      rank: IngredientRank;
      poolSize: number;
      note: string;
    };

export function addIngredient(inventory: Inventory, ingredientId: string, amount = 1) {
  inventory[ingredientId] = (inventory[ingredientId] ?? 0) + amount;
}

export function subtractIngredient(inventory: Inventory, ingredientId: string, amount = 1) {
  inventory[ingredientId] = Math.max(0, (inventory[ingredientId] ?? 0) - amount);
}

export function getTodayKey(now: number | Date = Date.now()) {
  const date = typeof now === "number" ? new Date(now) : now;
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: DAILY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function getYesterdayKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

export function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getNextDeliveryCountdown(
  pendingBoxes: number,
  lastDeliveryResolvedAt: number,
  now: number,
) {
  if (pendingBoxes >= MAX_PENDING_BOXES) {
    return "보관함이 가득 찼어요";
  }

  const elapsed = now - lastDeliveryResolvedAt;
  const remaining = DELIVERY_MS - (elapsed % DELIVERY_MS);
  return formatCountdown(remaining);
}

export function weightedPick<T extends { dropWeight: number }>(items: T[]) {
  const totalWeight = items.reduce((sum, item) => sum + item.dropWeight, 0);
  let target = Math.random() * totalWeight;

  for (const item of items) {
    target -= item.dropWeight;
    if (target <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

export function generateDeliveryBox() {
  return CATEGORY_META.map(({ id }) => weightedPick(INGREDIENT_GROUPS[id]).id);
}

export function summarizeRewards(ingredientIds: string[]) {
  const summary = ingredientIds.reduce<Record<string, number>>((accumulator, ingredientId) => {
    accumulator[ingredientId] = (accumulator[ingredientId] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(summary)
    .map(([ingredientId, amount]) => `${INGREDIENT_MAP.get(ingredientId)?.name ?? ingredientId} x${amount}`)
    .join(", ");
}

export function applyIngredientReward(inventory: Inventory, ingredientIds: string[]) {
  ingredientIds.forEach((ingredientId) => addIngredient(inventory, ingredientId, 1));
}

export function getSelectionIngredientCounts(selection: Selection) {
  return selection.reduce<Record<string, number>>((accumulator, ingredientId) => {
    accumulator[ingredientId] = (accumulator[ingredientId] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function hasEnoughIngredientsForSelection(inventory: Inventory, selection: Selection) {
  const required = getSelectionIngredientCounts(selection);
  return Object.entries(required).every(([ingredientId, amount]) => (inventory[ingredientId] ?? 0) >= amount);
}

export function getCraftedRecipePreview(selection: Selection, collection: GameState["collection"]) {
  const recipe = getRecipeFromSelection(selection);
  if (!recipe) {
    return null;
  }

  const record = collection[recipe.id];
  if (!record) {
    return null;
  }

  return { recipe, record };
}

export function getCraftPreview(selection: Selection, collection: GameState["collection"]): CraftPreview {
  if (selection.length === 0) {
    return {
      kind: "empty",
      message: "재료를 2개 이상 고르면 자유 조합 결과를 미리 볼 수 있어요.",
    };
  }

  if (selection.length < 2) {
    return {
      kind: "invalid",
      message: "자유 조합은 재료를 최소 2개부터 넣을 수 있어요.",
    };
  }

  if (selection.length > 5) {
    return {
      kind: "invalid",
      message: "자유 조합은 한 번에 최대 5개까지만 넣을 수 있어요.",
    };
  }

  const recipe = getFreeformCupcakeRecipe(selection);
  if (recipe) {
    return {
      kind: "cupcake",
      recipe,
      record: collection[recipe.id] ?? null,
    };
  }

  const upgradeRecipe = getIngredientUpgradeRecipe(selection);
  if (upgradeRecipe) {
    return {
      kind: "upgrade",
      ingredient: INGREDIENT_MAP.get(upgradeRecipe.resultIngredientId)!,
      recipe: upgradeRecipe,
    };
  }

  const rank = getHighestIngredientRank(selection);
  const pool = getFallbackIngredientPool(rank);
  if (!pool) {
    return {
      kind: "invalid",
      message: "현재 선택으로는 결과 후보를 찾을 수 없어요.",
    };
  }

  return {
    kind: "fallback",
    rank,
    poolSize: pool.ingredientIds.length,
    note: pool.note,
  };
}

export function resolveCraftResult(selection: Selection): CraftResult | null {
  if (selection.length < 2 || selection.length > 5) {
    return null;
  }

  const recipe = getFreeformCupcakeRecipe(selection);
  if (recipe) {
    return {
      type: "cupcake",
      recipe,
    };
  }

  const upgradeRecipe = getIngredientUpgradeRecipe(selection);
  if (upgradeRecipe) {
    const ingredient = INGREDIENT_MAP.get(upgradeRecipe.resultIngredientId);
    if (!ingredient) {
      return null;
    }

    return {
      type: "ingredient",
      ingredientId: ingredient.id,
      ingredient,
      rank: ingredient.rank,
      source: "upgrade",
      recipe: upgradeRecipe,
    };
  }

  const rank = getHighestIngredientRank(selection);
  const fallbackPool = getFallbackIngredientPool(rank);
  if (!fallbackPool) {
    return null;
  }

  const candidates = fallbackPool.ingredientIds
    .map((ingredientId) => INGREDIENT_MAP.get(ingredientId))
    .filter((ingredient): ingredient is Ingredient => Boolean(ingredient));
  const ingredient = weightedPick(candidates);

  return {
    type: "ingredient",
    ingredientId: ingredient.id,
    ingredient,
    rank,
    source: "fallback",
    recipe: null,
  };
}

export function synchronizePendingBoxes(snapshot: GameState, now = Date.now()) {
  if (snapshot.pendingBoxes >= MAX_PENDING_BOXES) {
    return snapshot;
  }

  const elapsed = now - snapshot.lastDeliveryResolvedAt;
  if (elapsed < DELIVERY_MS) {
    return snapshot;
  }

  const possibleBoxes = Math.floor(elapsed / DELIVERY_MS);
  const availableSpace = MAX_PENDING_BOXES - snapshot.pendingBoxes;
  const generatedBoxes = Math.min(possibleBoxes, availableSpace);

  if (generatedBoxes <= 0) {
    return snapshot;
  }

  const nextState = cloneGameState(snapshot);
  nextState.pendingBoxes += generatedBoxes;
  nextState.lastDeliveryResolvedAt =
    generatedBoxes < possibleBoxes ? now : snapshot.lastDeliveryResolvedAt + generatedBoxes * DELIVERY_MS;
  return nextState;
}

export function getTotalInventoryCount(inventory: Inventory) {
  return Object.values(inventory).reduce((sum, amount) => sum + amount, 0);
}

export function getSelectedCount(selection: Selection) {
  return selection.length;
}

export function getSelectedCategoryCount(selection: Selection) {
  return new Set(
    selection
      .map((ingredientId) => INGREDIENT_MAP.get(ingredientId)?.category)
      .filter((category): category is CategoryId => Boolean(category)),
  ).size;
}

export function getCategoryTotal(inventory: Inventory, categoryId: CategoryId) {
  return INGREDIENT_GROUPS[categoryId].reduce((sum, ingredient) => sum + (inventory[ingredient.id] ?? 0), 0);
}

export function getTopInventoryIngredients(inventory: Inventory, limit = 6) {
  return ALL_INGREDIENTS.filter((ingredient) => (inventory[ingredient.id] ?? 0) > 0)
    .sort((left, right) => {
      const amountDiff = (inventory[right.id] ?? 0) - (inventory[left.id] ?? 0);
      if (amountDiff !== 0) {
        return amountDiff;
      }
      return left.name.localeCompare(right.name, "ko");
    })
    .slice(0, limit);
}

export function getTotalCraftedCount(collection: GameState["collection"]) {
  return Object.values(collection).reduce((sum, entry) => sum + entry.count, 0);
}

export function getDiscoveryProgressPercent(discoveredCount: number, totalCount: number) {
  if (totalCount === 0) {
    return 0;
  }

  return Math.round((discoveredCount / totalCount) * 100);
}

export function getRankLabel(rank: IngredientRank) {
  return INGREDIENT_RANK_META[rank].label;
}
