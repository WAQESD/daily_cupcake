import { MAX_PENDING_BOXES, SHOWCASE_LIMIT, STORAGE_KEY } from "../config/game";
import { ALL_INGREDIENTS, RECIPES } from "../data/gameData";
import type { GameState, RecipeCollectionRecord, Selection } from "../types/game";

const STARTER_ITEMS: Array<[string, number]> = [
  ["vanilla-cloud", 2],
  ["milk-cloud", 2],
  ["cherry-bloom", 2],
  ["pink-ribbon", 2],
  ["strawberry-fairy", 1],
  ["strawberry-butter", 1],
  ["heart-sprinkle", 1],
  ["sparkle-sugar", 1],
];

export const DEFAULT_SELECTION: Selection = {
  batter: null,
  cream: null,
  topping: null,
  finisher: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function createBaseGameState(now = Date.now()): GameState {
  return {
    inventory: {},
    selection: { ...DEFAULT_SELECTION },
    discoveredRecipeIds: [],
    collection: {},
    favorites: [],
    pendingBoxes: 3,
    lastDeliveryResolvedAt: now,
    lastDailyClaimDate: "",
    dailyStreak: 0,
    lastDailyChallengeDate: "",
    lastCraftedRecipeId: null,
  };
}

export function cloneGameState(state: GameState): GameState {
  const collection = Object.fromEntries(
    Object.entries(state.collection).map(([recipeId, record]) => [recipeId, { ...record }]),
  ) as Record<string, RecipeCollectionRecord>;

  return {
    ...state,
    inventory: { ...state.inventory },
    selection: { ...state.selection },
    discoveredRecipeIds: [...state.discoveredRecipeIds],
    collection,
    favorites: [...state.favorites],
  };
}

export function createInitialGameState(now = Date.now()): GameState {
  const state = createBaseGameState(now);

  STARTER_ITEMS.forEach(([ingredientId, amount]) => {
    state.inventory[ingredientId] = amount;
  });

  return state;
}

export function normalizeGameState(rawState: unknown, now = Date.now()): GameState {
  const normalized = createBaseGameState(now);

  if (!isRecord(rawState)) {
    return normalized;
  }

  const rawInventory = isRecord(rawState.inventory) ? rawState.inventory : {};
  normalized.inventory = Object.fromEntries(
    ALL_INGREDIENTS.map((ingredient) => [
      ingredient.id,
      Math.max(0, toFiniteNumber(rawInventory[ingredient.id], 0)),
    ]),
  );

  const rawSelection = isRecord(rawState.selection) ? rawState.selection : {};
  normalized.selection = {
    batter: typeof rawSelection.batter === "string" ? rawSelection.batter : null,
    cream: typeof rawSelection.cream === "string" ? rawSelection.cream : null,
    topping: typeof rawSelection.topping === "string" ? rawSelection.topping : null,
    finisher: typeof rawSelection.finisher === "string" ? rawSelection.finisher : null,
  };

  const validRecipeIds = new Set(RECIPES.map((recipe) => recipe.id));
  normalized.discoveredRecipeIds = Array.isArray(rawState.discoveredRecipeIds)
    ? rawState.discoveredRecipeIds.filter(
        (recipeId): recipeId is string => typeof recipeId === "string" && validRecipeIds.has(recipeId),
      )
    : [];

  const rawCollection = isRecord(rawState.collection) ? rawState.collection : {};
  normalized.collection = Object.fromEntries(
    Object.entries(rawCollection)
      .filter(([recipeId]) => validRecipeIds.has(recipeId))
      .map(([recipeId, record]) => {
        const safeRecord = isRecord(record) ? record : {};
        return [
          recipeId,
          {
            count: Math.max(0, toFiniteNumber(safeRecord.count, 0)),
            firstCraftedAt: toFiniteNumber(safeRecord.firstCraftedAt, now),
            lastCraftedAt: toFiniteNumber(safeRecord.lastCraftedAt, now),
          },
        ];
      }),
  );

  normalized.favorites = Array.isArray(rawState.favorites)
    ? rawState.favorites
        .filter(
          (recipeId): recipeId is string => typeof recipeId === "string" && validRecipeIds.has(recipeId),
        )
        .slice(0, SHOWCASE_LIMIT)
    : [];

  normalized.pendingBoxes = clamp(toFiniteNumber(rawState.pendingBoxes, 3), 0, MAX_PENDING_BOXES);
  normalized.lastDeliveryResolvedAt = toFiniteNumber(rawState.lastDeliveryResolvedAt, now);
  normalized.lastDailyClaimDate =
    typeof rawState.lastDailyClaimDate === "string" ? rawState.lastDailyClaimDate : "";
  normalized.dailyStreak = Math.max(0, toFiniteNumber(rawState.dailyStreak, 0));
  normalized.lastDailyChallengeDate =
    typeof rawState.lastDailyChallengeDate === "string" ? rawState.lastDailyChallengeDate : "";
  normalized.lastCraftedRecipeId =
    typeof rawState.lastCraftedRecipeId === "string" && validRecipeIds.has(rawState.lastCraftedRecipeId)
      ? rawState.lastCraftedRecipeId
      : null;

  return normalized;
}

export function loadPersistedGameState(now = Date.now()): GameState {
  if (typeof window === "undefined") {
    return createInitialGameState(now);
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return createInitialGameState(now);
    }

    return normalizeGameState(JSON.parse(storedValue), now);
  } catch (error) {
    console.error("저장된 데이터를 불러오지 못했습니다.", error);
    return createInitialGameState(now);
  }
}

export function savePersistedGameState(snapshot: GameState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneGameState(snapshot)));
}

export function clearPersistedGameState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
