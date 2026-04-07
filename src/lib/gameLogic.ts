import { DAILY_TIMEZONE, DELIVERY_MS, MAX_PENDING_BOXES } from "../config/game";
import {
  ALL_INGREDIENTS,
  CATEGORY_META,
  INGREDIENT_GROUPS,
  INGREDIENT_MAP,
  getFallbackIngredientPool,
  getFreeformCupcakeRecipe,
  getIngredientUpgradeRecipe,
} from "../data/gameData";
import type { CategoryId, GameState, Ingredient, IngredientRank, Inventory, Recipe, Selection } from "../types/game";
import { cloneGameState } from "./gameState";

export const MIN_MIX_SELECTION = 2;
export const MAX_MIX_SELECTION = 5;

export interface MixingSelectionPreview {
  status: "too-few" | "cupcake" | "upgrade" | "fallback";
  message: string;
  recipe?: Recipe;
  ingredient?: Ingredient;
  rank?: IngredientRank;
  alreadyDiscovered?: boolean;
}

export type ResolvedCraftSelection =
  | { type: "error"; message: string }
  | { type: "cupcake"; recipe: Recipe }
  | { type: "ingredient"; ingredient: Ingredient; source: "upgrade" | "fallback"; rank: IngredientRank };

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

export function summarizeSelection(selection: Selection) {
  return selection.reduce<Record<string, number>>((accumulator, ingredientId) => {
    accumulator[ingredientId] = (accumulator[ingredientId] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function getSelectedIngredients(selection: Selection) {
  return selection
    .map((ingredientId) => INGREDIENT_MAP.get(ingredientId))
    .filter((ingredient): ingredient is Ingredient => Boolean(ingredient));
}

export function getSelectedIngredientsByCategory(selection: Selection, categoryId: CategoryId) {
  return getSelectedIngredients(selection).filter((ingredient) => ingredient.category === categoryId);
}

export function getSelectedCount(selection: Selection) {
  return selection.length;
}

export function hasEnoughIngredientsForSelection(inventory: Inventory, selection: Selection) {
  const requiredAmounts = summarizeSelection(selection);

  return Object.entries(requiredAmounts).every(([ingredientId, amount]) => (inventory[ingredientId] ?? 0) >= amount);
}

export function canSelectIngredient(selection: Selection, ingredientId: string) {
  return selection.includes(ingredientId) || selection.length < MAX_MIX_SELECTION;
}

export function getSelectionValidationMessage(selection: Selection, inventory: Inventory) {
  if (selection.length < MIN_MIX_SELECTION) {
    return `재료를 최소 ${MIN_MIX_SELECTION}개 골라 주세요.`;
  }

  if (selection.length > MAX_MIX_SELECTION) {
    return `재료는 최대 ${MAX_MIX_SELECTION}개까지만 섞을 수 있어요.`;
  }

  if (!hasEnoughIngredientsForSelection(inventory, selection)) {
    return "선택한 재료 수량이 부족해요. 배달 상자를 열거나 다른 조합을 골라 주세요.";
  }

  return null;
}

function getHighestIngredientRank(ingredients: Ingredient[]): IngredientRank {
  return ingredients.some((ingredient) => ingredient.rank === "refined") ? "refined" : "base";
}

export function getMixingSelectionPreview(
  selection: Selection,
  discoveredRecipeIds: string[] = [],
): MixingSelectionPreview {
  if (selection.length < MIN_MIX_SELECTION) {
    return {
      status: "too-few",
      message: `지금은 ${selection.length}개를 골랐어요. 최소 ${MIN_MIX_SELECTION}개부터 자유 조합을 시작할 수 있어요.`,
    };
  }

  const cupcakeRecipe = getFreeformCupcakeRecipe(selection);
  if (cupcakeRecipe) {
    const alreadyDiscovered = discoveredRecipeIds.includes(cupcakeRecipe.id);
    return {
      status: "cupcake",
      recipe: cupcakeRecipe,
      alreadyDiscovered,
      message: alreadyDiscovered
        ? `${cupcakeRecipe.name} 조합이에요. 이미 발견한 레시피라 다시 구우면 제작 횟수만 올라가요.`
        : `${cupcakeRecipe.name} 조합이에요. 아직 굽지 않았다면 새 컵케이크로 도감이 열려요.`,
    };
  }

  const upgradeRecipe = getIngredientUpgradeRecipe(selection);
  if (upgradeRecipe) {
    const ingredient = INGREDIENT_MAP.get(upgradeRecipe.resultIngredientId);
    if (ingredient) {
      return {
        status: "upgrade",
        ingredient,
        rank: ingredient.rank,
        message: `${ingredient.name} 승급 조합이에요. 컵케이크보다 재료 승급보다 우선순위가 낮게 설계된 조합만 여기에 도착해요.`,
      };
    }
  }

  const fallbackRank = getHighestIngredientRank(getSelectedIngredients(selection));
  return {
    status: "fallback",
    rank: fallbackRank,
    message:
      fallbackRank === "refined"
        ? "정의된 조합은 아니에요. 이번에는 승급 등급 재료 후보군에서 랜덤 결과가 나와요."
        : "정의된 조합은 아니에요. 이번에는 기본 등급 재료 후보군에서 랜덤 결과가 나와요.",
  };
}

export function resolveCraftSelection(inventory: Inventory, selection: Selection): ResolvedCraftSelection {
  const validationMessage = getSelectionValidationMessage(selection, inventory);
  if (validationMessage) {
    return { type: "error", message: validationMessage };
  }

  const cupcakeRecipe = getFreeformCupcakeRecipe(selection);
  if (cupcakeRecipe) {
    return { type: "cupcake", recipe: cupcakeRecipe };
  }

  const upgradeRecipe = getIngredientUpgradeRecipe(selection);
  if (upgradeRecipe) {
    const ingredient = INGREDIENT_MAP.get(upgradeRecipe.resultIngredientId);
    if (!ingredient) {
      return { type: "error", message: "승급 결과 재료를 찾지 못했어요." };
    }

    return {
      type: "ingredient",
      ingredient,
      source: "upgrade",
      rank: ingredient.rank,
    };
  }

  const selectedIngredients = getSelectedIngredients(selection);
  const fallbackRank = getHighestIngredientRank(selectedIngredients);
  const fallbackPool = getFallbackIngredientPool(fallbackRank);
  const candidates =
    fallbackPool?.ingredientIds
      .map((ingredientId) => INGREDIENT_MAP.get(ingredientId))
      .filter((ingredient): ingredient is Ingredient => Boolean(ingredient)) ?? [];

  if (candidates.length === 0) {
    return { type: "error", message: "랜덤 fallback 후보 재료를 찾지 못했어요." };
  }

  return {
    type: "ingredient",
    ingredient: weightedPick(candidates),
    source: "fallback",
    rank: fallbackRank,
  };
}

export function spendSelectionIngredients(inventory: Inventory, selection: Selection) {
  const requiredAmounts = summarizeSelection(selection);
  Object.entries(requiredAmounts).forEach(([ingredientId, amount]) => {
    subtractIngredient(inventory, ingredientId, amount);
  });
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
