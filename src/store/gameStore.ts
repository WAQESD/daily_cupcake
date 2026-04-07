import { create } from "zustand";
import { BOXES_PER_DAILY_GIFT, SHOWCASE_LIMIT } from "../config/game";
import { INGREDIENT_GROUPS, getDailyRecipe } from "../data/gameData";
import {
  MAX_MIX_SELECTION,
  addIngredient,
  applyIngredientReward,
  generateDeliveryBox,
  getTodayKey,
  getYesterdayKey,
  resolveCraftSelection,
  spendSelectionIngredients,
  summarizeRewards,
  synchronizePendingBoxes,
  weightedPick,
} from "../lib/gameLogic";
import {
  clearPersistedGameState,
  cloneGameState,
  createInitialGameState,
  DEFAULT_SELECTION,
  loadPersistedGameState,
  savePersistedGameState,
} from "../lib/gameState";
import type { GameState, PageId, UiState } from "../types/game";

const DEFAULT_UI_STATE: UiState = {
  deliveryMessage: "처음 선물 상자 3개가 준비되어 있어요. 바로 열어서 시작해 보세요.",
  craftMessage: "",
  challengeMessage: "",
};

export interface GameStore extends GameState, UiState {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  replaceGameState: (nextState: GameState) => void;
  syncDeliveryBoxes: (now?: number) => void;
  claimPendingBoxes: () => void;
  claimDailyGift: () => void;
  craftCupcake: () => void;
  clearSelection: () => void;
  toggleSelection: (ingredientId: string) => void;
  toggleFavorite: (recipeId: string) => void;
  resetGame: () => void;
}

function pickGameState(state: GameStore): GameState {
  return {
    inventory: state.inventory,
    selection: state.selection,
    discoveredRecipeIds: state.discoveredRecipeIds,
    collection: state.collection,
    favorites: state.favorites,
    pendingBoxes: state.pendingBoxes,
    lastDeliveryResolvedAt: state.lastDeliveryResolvedAt,
    lastDailyClaimDate: state.lastDailyClaimDate,
    dailyStreak: state.dailyStreak,
    lastDailyChallengeDate: state.lastDailyChallengeDate,
    lastCraftedRecipeId: state.lastCraftedRecipeId,
    lastCraftedIngredientId: state.lastCraftedIngredientId,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...loadPersistedGameState(),
  ...DEFAULT_UI_STATE,
  activePage: "home",

  setActivePage: (activePage) => {
    set({ activePage });
  },

  replaceGameState: (nextState) => {
    const snapshot = cloneGameState(nextState);
    set((state) => ({
      ...snapshot,
      activePage: state.activePage,
      deliveryMessage: "저장 데이터를 가져와 현재 진행 상태를 복원했어요.",
      craftMessage: "",
      challengeMessage: "",
    }));
  },

  syncDeliveryBoxes: (now = Date.now()) => {
    const current = get();
    const synced = synchronizePendingBoxes(current, now);

    if (
      synced.pendingBoxes === current.pendingBoxes &&
      synced.lastDeliveryResolvedAt === current.lastDeliveryResolvedAt
    ) {
      return;
    }

    set({
      pendingBoxes: synced.pendingBoxes,
      lastDeliveryResolvedAt: synced.lastDeliveryResolvedAt,
    });
  },

  claimPendingBoxes: () => {
    get().syncDeliveryBoxes();

    const current = get();
    if (current.pendingBoxes <= 0) {
      set({
        deliveryMessage: "아직 상자가 도착하지 않았어요. 조금만 기다리면 새 상자가 와요.",
      });
      return;
    }

    const rewards: string[] = [];
    for (let count = 0; count < current.pendingBoxes; count += 1) {
      rewards.push(...generateDeliveryBox());
    }

    const boxesToOpen = current.pendingBoxes;
    const now = Date.now();

    set((state) => {
      const inventory = { ...state.inventory };
      applyIngredientReward(inventory, rewards);

      return {
        inventory,
        pendingBoxes: 0,
        lastDeliveryResolvedAt: now,
        deliveryMessage: `${boxesToOpen}상자를 열어 재료를 받았어요. ${summarizeRewards(rewards)}`,
      };
    });
  },

  claimDailyGift: () => {
    const todayKey = getTodayKey();
    const current = get();

    if (current.lastDailyClaimDate === todayKey) {
      set({
        deliveryMessage: "오늘의 데일리 선물은 이미 받았어요. 내일 다시 찾아와 주세요.",
      });
      return;
    }

    const rewards: string[] = [];
    for (let count = 0; count < BOXES_PER_DAILY_GIFT; count += 1) {
      rewards.push(...generateDeliveryBox());
    }
    rewards.push(weightedPick(INGREDIENT_GROUPS.finisher).id);
    rewards.push(weightedPick(INGREDIENT_GROUPS.topping).id);

    set((state) => {
      const inventory = { ...state.inventory };
      applyIngredientReward(inventory, rewards);

      return {
        inventory,
        dailyStreak: state.lastDailyClaimDate === getYesterdayKey(todayKey) ? state.dailyStreak + 1 : 1,
        lastDailyClaimDate: todayKey,
        deliveryMessage: `데일리 선물을 받았어요. ${summarizeRewards(rewards)}`,
      };
    });
  },

  craftCupcake: () => {
    const current = get();
    const outcome = resolveCraftSelection(current.inventory, current.selection);

    if (outcome.type === "error") {
      set({
        craftMessage: outcome.message,
      });
      return;
    }

    const now = Date.now();
    const todayKey = getTodayKey(now);

    set((state) => {
      const inventory = { ...state.inventory };
      spendSelectionIngredients(inventory, state.selection);

      if (outcome.type === "ingredient") {
        addIngredient(inventory, outcome.ingredient.id, 1);

        return {
          inventory,
          lastCraftedRecipeId: null,
          lastCraftedIngredientId: outcome.ingredient.id,
          craftMessage:
            outcome.source === "upgrade"
              ? `${outcome.ingredient.name} 승급에 성공했어요. 인벤토리에 새 재료가 1개 추가됐어요.`
              : `${outcome.ingredient.name} 재료를 얻었어요. 정확한 레시피는 아니지만 ${outcome.rank === "refined" ? "승급" : "기본"} 등급 후보군 안에서 결과가 나왔어요.`,
        };
      }

      const recipe = outcome.recipe;
      const firstDiscovery = !state.discoveredRecipeIds.includes(recipe.id);
      const discoveredRecipeIds = firstDiscovery
        ? [...state.discoveredRecipeIds, recipe.id]
        : state.discoveredRecipeIds;

      const existingRecord = state.collection[recipe.id];
      const collection = {
        ...state.collection,
        [recipe.id]: {
          count: (existingRecord?.count ?? 0) + 1,
          firstCraftedAt: existingRecord?.firstCraftedAt ?? now,
          lastCraftedAt: now,
        },
      };

      let challengeMessage = state.challengeMessage;
      let lastDailyChallengeDate = state.lastDailyChallengeDate;

      if (recipe.id === getDailyRecipe(todayKey).id && state.lastDailyChallengeDate !== todayKey) {
        const bonus = [...generateDeliveryBox(), weightedPick(INGREDIENT_GROUPS.cream).id];
        applyIngredientReward(inventory, bonus);
        lastDailyChallengeDate = todayKey;
        challengeMessage = `오늘의 추천 레시피를 완성해서 보너스를 받았어요. ${summarizeRewards(bonus)}`;
      }

      return {
        inventory,
        discoveredRecipeIds,
        collection,
        lastCraftedRecipeId: recipe.id,
        lastCraftedIngredientId: null,
        lastDailyChallengeDate,
        challengeMessage,
        craftMessage: firstDiscovery
          ? `새 레시피를 발견했어요. ${recipe.name} 도감이 열렸어요.`
          : `${recipe.name}를 다시 만들었어요. 진열장에 예쁘게 올려 보세요.`,
      };
    });
  },

  clearSelection: () => {
    set({
      selection: [...DEFAULT_SELECTION],
      craftMessage: "",
    });
  },

  toggleSelection: (ingredientId) => {
    set((state) => {
      if (state.selection.includes(ingredientId)) {
        return {
          selection: state.selection.filter((selectedId) => selectedId !== ingredientId),
          craftMessage: "",
        };
      }

      if (state.selection.length >= MAX_MIX_SELECTION) {
        return {
          craftMessage: `재료는 최대 ${MAX_MIX_SELECTION}개까지만 고를 수 있어요.`,
        };
      }

      return {
        selection: [...state.selection, ingredientId],
        craftMessage: "",
      };
    });
  },

  toggleFavorite: (recipeId) => {
    const current = get();
    const favorites = new Set(current.favorites);

    if (favorites.has(recipeId)) {
      favorites.delete(recipeId);
      set({ favorites: Array.from(favorites) });
      return;
    }

    if (favorites.size >= SHOWCASE_LIMIT) {
      set({
        craftMessage: `진열장은 최대 ${SHOWCASE_LIMIT}종까지 올릴 수 있어요. 먼저 하나를 내려 주세요.`,
      });
      return;
    }

    favorites.add(recipeId);
    set({ favorites: Array.from(favorites) });
  },

  resetGame: () => {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("정말 저장 데이터를 초기화할까요? 도감과 진열장 기록이 모두 지워져요.");

    if (!confirmed) {
      return;
    }

    clearPersistedGameState();
    set({
      ...createInitialGameState(),
      ...DEFAULT_UI_STATE,
      activePage: "home",
      deliveryMessage: "새로 시작했어요. 처음 상자 3개와 스타터 재료를 준비했어요.",
    });
  },
}));

if (typeof window !== "undefined") {
  useGameStore.subscribe((state) => {
    savePersistedGameState(pickGameState(state));
  });
}
