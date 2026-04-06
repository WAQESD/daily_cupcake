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

const SAVE_TRANSFER_PREFIX = "daily-cupcake-save";
const SAVE_TRANSFER_VERSION = 1;
const REQUIRED_GAME_STATE_KEYS: Array<keyof GameState> = [
  "inventory",
  "selection",
  "discoveredRecipeIds",
  "collection",
  "favorites",
  "pendingBoxes",
  "lastDeliveryResolvedAt",
  "lastDailyClaimDate",
  "dailyStreak",
  "lastDailyChallengeDate",
  "lastCraftedRecipeId",
];

const VALID_SELECTION_VALUES = {
  batter: new Set(ALL_INGREDIENTS.filter((ingredient) => ingredient.category === "batter").map((ingredient) => ingredient.id)),
  cream: new Set(ALL_INGREDIENTS.filter((ingredient) => ingredient.category === "cream").map((ingredient) => ingredient.id)),
  topping: new Set(ALL_INGREDIENTS.filter((ingredient) => ingredient.category === "topping").map((ingredient) => ingredient.id)),
  finisher: new Set(ALL_INGREDIENTS.filter((ingredient) => ingredient.category === "finisher").map((ingredient) => ingredient.id)),
} satisfies Record<keyof Selection, Set<string>>;

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

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(`${normalized}${padding}`);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function gzipText(text: string) {
  if (typeof CompressionStream === "undefined") {
    throw new Error("이 브라우저는 저장 문자열 압축을 지원하지 않아요. 최신 브라우저에서 다시 시도해 주세요.");
  }

  const compressedStream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(compressedStream).arrayBuffer());
}

async function gunzipToText(bytes: Uint8Array) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("이 브라우저는 저장 문자열 복원을 지원하지 않아요. 최신 브라우저에서 다시 시도해 주세요.");
  }

  const decompressedStream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return await new Response(decompressedStream).text();
}

function validateSaveTransferPayload(payload: unknown): asserts payload is {
  format: string;
  version: number;
  data: unknown;
} {
  if (!isRecord(payload)) {
    throw new Error("저장 문자열 안의 데이터 형식이 올바르지 않아요.");
  }

  if (payload.format !== SAVE_TRANSFER_PREFIX) {
    throw new Error("이 앱에서 만든 저장 문자열이 아니에요.");
  }

  if (payload.version !== SAVE_TRANSFER_VERSION) {
    throw new Error("지원하지 않는 저장 데이터 버전이에요.");
  }

  if (!isRecord(payload.data)) {
    throw new Error("가져올 저장 데이터가 비어 있어요.");
  }

  const missingKeys = REQUIRED_GAME_STATE_KEYS.filter((key) => !(key in payload.data));
  if (missingKeys.length > 0) {
    throw new Error("필수 저장 항목이 빠져 있어 가져올 수 없어요.");
  }
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
    batter:
      typeof rawSelection.batter === "string" && VALID_SELECTION_VALUES.batter.has(rawSelection.batter)
        ? rawSelection.batter
        : null,
    cream:
      typeof rawSelection.cream === "string" && VALID_SELECTION_VALUES.cream.has(rawSelection.cream)
        ? rawSelection.cream
        : null,
    topping:
      typeof rawSelection.topping === "string" && VALID_SELECTION_VALUES.topping.has(rawSelection.topping)
        ? rawSelection.topping
        : null,
    finisher:
      typeof rawSelection.finisher === "string" && VALID_SELECTION_VALUES.finisher.has(rawSelection.finisher)
        ? rawSelection.finisher
        : null,
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

export async function exportGameState(snapshot: GameState) {
  const payload = JSON.stringify({
    format: SAVE_TRANSFER_PREFIX,
    version: SAVE_TRANSFER_VERSION,
    storageKey: STORAGE_KEY,
    exportedAt: new Date().toISOString(),
    data: cloneGameState(snapshot),
  });

  const compressed = await gzipText(payload);
  return `${SAVE_TRANSFER_PREFIX}:${SAVE_TRANSFER_VERSION}:${bytesToBase64Url(compressed)}`;
}

export async function importGameState(rawValue: string, now = Date.now()) {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    throw new Error("가져올 문자열을 먼저 붙여넣어 주세요.");
  }

  const [format, version, encoded, ...rest] = trimmedValue.split(":");
  if (!format || !version || !encoded || rest.length > 0) {
    throw new Error("저장 문자열 형식이 올바르지 않아요.");
  }

  if (format !== SAVE_TRANSFER_PREFIX || version !== String(SAVE_TRANSFER_VERSION)) {
    throw new Error("지원하지 않는 저장 문자열이에요.");
  }

  let decodedText = "";
  try {
    decodedText = await gunzipToText(base64UrlToBytes(encoded));
  } catch (error) {
    console.error("저장 문자열을 해제하지 못했습니다.", error);
    throw new Error("문자열을 풀지 못했어요. 손상되었거나 잘못된 데이터예요.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(decodedText);
  } catch (error) {
    console.error("저장 문자열의 JSON 파싱에 실패했습니다.", error);
    throw new Error("저장 문자열 안의 데이터 형식이 올바르지 않아요.");
  }

  validateSaveTransferPayload(payload);
  return normalizeGameState(payload.data, now);
}
