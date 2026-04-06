import { create } from "zustand";
import { BOXES_PER_DAILY_GIFT, SHOWCASE_LIMIT } from "../config/game";
import { CATEGORY_META, INGREDIENT_GROUPS, getDailyRecipe, getRecipeFromSelection } from "../data/gameData";
import {
  applyIngredientReward,
  generateDeliveryBox,
  getTodayKey,
  getYesterdayKey,
  hasEnoughIngredientsForSelection,
  subtractIngredient,
  summarizeRewards,
  synchronizePendingBoxes,
  weightedPick,
} from "../lib/gameLogic";
import {
  clearPersistedGameState,
  createInitialGameState,
  DEFAULT_SELECTION,
  loadPersistedGameState,
  savePersistedGameState,
} from "../lib/gameState";
import type { CategoryId, GameState, PageId, UiState } from "../types/game";

const DEFAULT_UI_STATE: UiState = {
  deliveryMessage: "처음 선물 상자 3개가 준비되어 있어요. 바로 열어서 시작해 보세요.",
  craftMessage: "",
  challengeMessage: "",
};

export interface GameStore extends GameState, UiState {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  syncDeliveryBoxes: (now?: number) => void;
  claimPendingBoxes: () => void;
  claimDailyGift: () => void;
  craftCupcake: () => void;
  clearSelection: () => void;
  toggleSelection: (categoryId: CategoryId, ingredientId: string) => void;
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
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...loadPersistedGameState(),
  ...DEFAULT_UI_STATE,
  activePage: "home",

  setActivePage: (activePage) => {
    set({ activePage });
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
    const recipe = getRecipeFromSelection(current.selection);

    if (!recipe) {
      set({
        craftMessage: "반죽, 크림, 토핑, 마무리를 모두 골라 주세요.",
      });
      return;
    }

    if (!hasEnoughIngredientsForSelection(current.inventory, current.selection)) {
      set({
        craftMessage: "선택한 재료 수량이 부족해요. 배달 상자를 먼저 열어 주세요.",
      });
      return;
    }

    const now = Date.now();
    const todayKey = getTodayKey(now);

    set((state) => {
      const inventory = { ...state.inventory };
      CATEGORY_META.forEach(({ id }) => {
        const ingredientId = state.selection[id];
        if (ingredientId) {
          subtractIngredient(inventory, ingredientId, 1);
        }
      });

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
      selection: { ...DEFAULT_SELECTION },
      craftMessage: "",
    });
  },

  toggleSelection: (categoryId, ingredientId) => {
    set((state) => ({
      selection: {
        ...state.selection,
        [categoryId]: state.selection[categoryId] === ingredientId ? null : ingredientId,
      },
      craftMessage: "",
    }));
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
