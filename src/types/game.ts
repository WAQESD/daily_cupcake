export type CategoryId = "batter" | "cream" | "topping" | "finisher";
export type IngredientRank = 1 | 2;

export type IngredientFamily =
  | "berry"
  | "cloud"
  | "cocoa"
  | "forest"
  | "sun"
  | "garden"
  | "dream"
  | "star"
  | "moon";

export type Rarity = "common" | "rare" | "epic" | "legendary";
export type PageId = "home" | "bakery" | "delivery" | "collection" | "showcase";

export interface Ingredient {
  id: string;
  category: CategoryId;
  name: string;
  short: string;
  family: IngredientFamily;
  rank: IngredientRank;
  dropWeight: number;
  color: string;
  accent: string;
}

export interface IngredientRankMetaEntry {
  label: string;
  accent: string;
  description: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  description: string;
}

export interface CollectionMetaEntry {
  label: string;
  accent: string;
}

export interface RarityMetaEntry {
  label: string;
  accent: string;
}

export interface RecipePalette {
  wrapper: string;
  cake: string;
  cream: string;
  frostingAccent: string;
  topping: string;
  topperAccent: string;
  finish: string;
  finishAccent: string;
  rarity: string;
  collection: string;
}

export interface Recipe {
  id: string;
  index: number;
  name: string;
  description: string;
  collection: IngredientFamily;
  collectionLabel: string;
  rarity: Rarity;
  rarityLabel: string;
  ingredientIds: string[];
  mixKey: string;
  ingredients: Ingredient[];
  palette: RecipePalette;
}

export interface CupcakeRecipeRule {
  id: string;
  ingredientIds: string[];
  mixKey: string;
  resultType: "cupcake";
  recipeId: string;
}

export interface IngredientUpgradeRule {
  id: string;
  ingredientIds: string[];
  mixKey: string;
  resultType: "ingredient";
  ingredientId: string;
  resultRank: IngredientRank;
}

export interface FallbackResultPool {
  rank: IngredientRank;
  ingredientIds: string[];
}

export interface FreeformRecipePrototype {
  id: string;
  name: string;
  ingredientIds: string[];
  mixKey: string;
  notes: string;
}

export type Inventory = Record<string, number>;
export type Selection = Record<CategoryId, string | null>;
export type MixSelection = string[];

export interface RecipeCollectionRecord {
  count: number;
  firstCraftedAt: number;
  lastCraftedAt: number;
}

export interface GameState {
  inventory: Inventory;
  selection: Selection;
  discoveredRecipeIds: string[];
  collection: Record<string, RecipeCollectionRecord>;
  favorites: string[];
  pendingBoxes: number;
  lastDeliveryResolvedAt: number;
  lastDailyClaimDate: string;
  dailyStreak: number;
  lastDailyChallengeDate: string;
  lastCraftedRecipeId: string | null;
}

export interface UiState {
  deliveryMessage: string;
  craftMessage: string;
  challengeMessage: string;
}
