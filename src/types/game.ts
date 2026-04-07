export type CategoryId = "batter" | "cream" | "topping" | "finisher";

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

export type IngredientRank = "base" | "refined";
export type Rarity = "common" | "rare" | "epic" | "legendary";
export type RecipeKind = "mixing" | "legacy";

export type PageId = "home" | "bakery" | "delivery" | "collection" | "showcase";

export interface Ingredient {
  id: string;
  category: CategoryId;
  name: string;
  short: string;
  family: IngredientFamily;
  rank: IngredientRank;
  rarity: number;
  dropWeight: number;
  color: string;
  accent: string;
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

export interface IngredientRankMetaEntry {
  label: string;
  description: string;
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
  kind: RecipeKind;
  name: string;
  description: string;
  collection: IngredientFamily;
  collectionLabel: string;
  rarity: Rarity;
  rarityLabel: string;
  ingredientIds: string[];
  ingredients: Ingredient[];
  palette: RecipePalette;
}

export interface IngredientUpgradeRecipe {
  id: string;
  ingredientIds: string[];
  ingredients: Ingredient[];
  resultIngredientId: string;
  resultRank: IngredientRank;
  note: string;
}

export interface FallbackIngredientPool {
  rank: IngredientRank;
  ingredientIds: string[];
  note: string;
}

export type Inventory = Record<string, number>;
export type Selection = string[];

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
  lastCraftedIngredientId: string | null;
}

export interface UiState {
  deliveryMessage: string;
  craftMessage: string;
  challengeMessage: string;
}
