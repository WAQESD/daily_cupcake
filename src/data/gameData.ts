import type {
  CategoryId,
  CategoryMeta,
  CollectionMetaEntry,
  CupcakeRecipeRule,
  FallbackResultPool,
  FreeformRecipePrototype,
  Ingredient,
  IngredientFamily,
  IngredientRank,
  IngredientRankMetaEntry,
  IngredientUpgradeRule,
  Rarity,
  RarityMetaEntry,
  Recipe,
  RecipePalette,
  Selection,
} from "../types/game";

type LegacyRecipeSeed = {
  id: string;
  ingredientIds: string[];
};

const LEGACY_CATEGORY_ORDER: CategoryId[] = ["batter", "cream", "topping", "finisher"];

const BATTERS: Ingredient[] = [
  {
    id: "vanilla-cloud",
    category: "batter",
    name: "바닐라 구름 반죽",
    short: "바닐라",
    family: "cloud",
    rank: 1,
    dropWeight: 8,
    color: "#ffd6b5",
    accent: "#fff4de",
  },
  {
    id: "choco-puff",
    category: "batter",
    name: "초코 퍼프 반죽",
    short: "초콈",
    family: "cocoa",
    rank: 1,
    dropWeight: 8,
    color: "#c69272",
    accent: "#f2d1be",
  },
  {
    id: "strawberry-fairy",
    category: "batter",
    name: "딸기 요정 반죽",
    short: "딸기",
    family: "berry",
    rank: 1,
    dropWeight: 8,
    color: "#ff9eb5",
    accent: "#ffe3ea",
  },
  {
    id: "matcha-forest",
    category: "batter",
    name: "말차 숲 반죽",
    short: "말차",
    family: "forest",
    rank: 2,
    dropWeight: 5,
    color: "#b6d7a8",
    accent: "#eef7d8",
  },
  {
    id: "lemon-sun",
    category: "batter",
    name: "레몬 선샤인 반죽",
    short: "레몬",
    family: "sun",
    rank: 2,
    dropWeight: 5,
    color: "#ffe28a",
    accent: "#fff8cf",
  },
];

const CREAMS: Ingredient[] = [
  {
    id: "milk-cloud",
    category: "cream",
    name: "우유 구름 크림",
    short: "우유구릈",
    family: "cloud",
    rank: 1,
    dropWeight: 8,
    color: "#fff7f9",
    accent: "#ffe7ef",
  },
  {
    id: "strawberry-butter",
    category: "cream",
    name: "딸기 버터 크림",
    short: "딸기버터",
    family: "berry",
    rank: 1,
    dropWeight: 8,
    color: "#ffbdd4",
    accent: "#ffe8f1",
  },
  {
    id: "cream-cheese",
    category: "cream",
    name: "크림치즈 크림",
    short: "크림치즈",
    family: "garden",
    rank: 2,
    dropWeight: 5,
    color: "#fff1d6",
    accent: "#ffe1b4",
  },
  {
    id: "cotton-candy",
    category: "cream",
    name: "솜사탕 크림",
    short: "솜사탕",
    family: "dream",
    rank: 2,
    dropWeight: 5,
    color: "#ffd3ef",
    accent: "#dff7ff",
  },
  {
    id: "caramel-ribbon",
    category: "cream",
    name: "카라멜 리본 크림",
    short: "카라멜",
    family: "cocoa",
    rank: 2,
    dropWeight: 5,
    color: "#e6b588",
    accent: "#fff0d6",
  },
];

const TOPPINGS: Ingredient[] = [
  {
    id: "cherry-bloom",
    category: "topping",
    name: "체리 블룸 토핑",
    short: "체리",
    family: "berry",
    rank: 1,
    dropWeight: 8,
    color: "#ff6f91",
    accent: "#ffd9e5",
  },
  {
    id: "heart-sprinkle",
    category: "topping",
    name: "하트 스프링클 토핑",
    short: "하트",
    family: "dream",
    rank: 1,
    dropWeight: 8,
    color: "#ff94c2",
    accent: "#ffe7f3",
  },
  {
    id: "bunny-marshmallow",
    category: "topping",
    name: "토끼 마시로로 토핑",
    short: "토끼",
    family: "cloud",
    rank: 2,
    dropWeight: 5,
    color: "#fffdf8",
    accent: "#ffd5e9",
  },
  {
    id: "cookie-star",
    category: "topping",
    name: "쿠키 스타 토핑",
    short: "쿠키별",
    family: "star",
    rank: 2,
    dropWeight: 5,
    color: "#d0a77d",
    accent: "#fff2cc",
  },
  {
    id: "blueberry-pearl",
    category: "topping",
    name: "블루베리 진주 토핑",
    short: "블루진주",
    family: "moon",
    rank: 2,
    dropWeight: 5,
    color: "#8898ff",
    accent: "#e6ebff",
  },
];

const FINISHERS: Ingredient[] = [
  {
    id: "pink-ribbon",
    category: "finisher",
    name: "별칼 리본 마무리",
    short: "리본",
    family: "berry",
    rank: 1,
    dropWeight: 8,
    color: "#ff8fb8",
    accent: "#fff0f6",
  },
  {
    id: "sparkle-sugar",
    category: "finisher",
    name: "반짝 수가 마무리",
    short: "반짝",
    family: "star",
    rank: 1,
    dropWeight: 8,
    color: "#fff6f0",
    accent: "#ffe8aa",
  },
  {
    id: "flower-candy",
    category: "finisher",
    name: "꽃잎 캔디 마무리",
    short: "꽃잎",
    family: "garden",
    rank: 2,
    dropWeight: 5,
    color: "#ffb7d2",
    accent: "#ffdff0",
  },
  {
    id: "stardust",
    category: "finisher",
    name: "별가루 마무리",
    short: "별가루",
    family: "moon",
    rank: 2,
    dropWeight: 5,
    color: "#c3caff",
    accent: "#eef1ff",
  },
  {
    id: "honey-drizzle",
    category: "finisher",
    name: "허니 시럽 마무리",
    short: "허니",
    family: "sun",
    rank: 2,
    dropWeight: 5,
    color: "#ffc95c",
    accent: "#fff3bc",
  },
];

const CATEGORY_META: CategoryMeta[] = [
  { id: "batter", label: "반죽", description: "컵케이크의 바닥이 되는 폭신한 반죽" },
  { id: "cream", label: "크림", description: "위에 올리는 메인 크림" },
  { id: "topping", label: "토핑", description: "귀여운 장식과 포인트 토핑" },
  { id: "finisher", label: "마무리", description: "마지막 분위기를 결정하는 장식" },
];

const INGREDIENT_RANK_META: Record<IngredientRank, IngredientRankMetaEntry> = {
  1: {
    label: "기본 재료",
    accent: "#ffd7ea",
    description: "배달 상자에서 자주 얻는 시작 등급 재료",
  },
  2: {
    label: "승급 재료",
    accent: "#ffc95c",
    description: "특정 조합이나 높은 등급 결과에서 얻는 확장 재료",
  },
};

const COLLECTION_META: Record<IngredientFamily, CollectionMetaEntry> = {
  berry: { label: "베리 정원", accent: "#ff8ab4" },
  cloud: { label: "구름 티룸", accent: "#ffd7ea" },
  cocoa: { label: "코코아 살롱", accent: "#d79c7d" },
  forest: { label: "말차 숲", accent: "#add6a8" },
  sun: { label: "햇살 온실", accent: "#ffd86d" },
  garden: { label: "꽃정원", accent: "#ffb8cf" },
  dream: { label: "솜사탕 방", accent: "#f4b5ff" },
  star: { label: "반짝 공방", accent: "#ffd55c" },
  moon: { label: "별빛 다락방", accent: "#b8bfff" },
};

const RARITY_META: Record<Rarity, RarityMetaEntry> = {
  common: { label: "포근", accent: "#ffc9db" },
  rare: { label: "반짝", accent: "#ffb86b" },
  epic: { label: "화사", accent: "#88c6ff" },
  legendary: { label: "꿈빛", accent: "#ff7aa8" },
};

const INGREDIENT_GROUPS: Record<CategoryId, Ingredient[]> = {
  batter: BATTERS,
  cream: CREAMS,
  topping: TOPPINGS,
  finisher: FINISHERS,
};

const ALL_INGREDIENTS: Ingredient[] = Object.values(INGREDIENT_GROUPS).flat();
const INGREDIENT_MAP = new Map<string, Ingredient>(ALL_INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]));

function countFamilies(ingredients: Ingredient[]) {
  return ingredients.reduce<Partial<Record<IngredientFamily, number>>>((accumulator, ingredient) => {
    accumulator[ingredient.family] = (accumulator[ingredient.family] ?? 0) + 1;
    return accumulator;
  }, {});
}

function sortByCategoryOrder(ingredients: Ingredient[]) {
  return [...ingredients].sort(
    (left, right) =>
      LEGACY_CATEGORY_ORDER.indexOf(left.category) - LEGACY_CATEGORY_ORDER.indexOf(right.category),
  );
}

function sortForTitle(ingredients: Ingredient[]) {
  const finisher = ingredients.find((ingredient) => ingredient.category === "finisher");
  const cream = ingredients.find((ingredient) => ingredient.category === "cream");
  const batter = ingredients.find((ingredient) => ingredient.category === "batter");
  const topping = ingredients.find((ingredient) => ingredient.category === "topping");

  const ordered = [finisher, cream, batter, topping].filter(
    (ingredient): ingredient is Ingredient => Boolean(ingredient),
  );

  return ordered.length > 0 ? ordered : ingredients;
}

function pickDominantFamily(ingredients: Ingredient[]): IngredientFamily {
  const familyCount = countFamilies(ingredients);
  const rankedFamilies = Object.entries(familyCount) as Array<[IngredientFamily, number]>;

  rankedFamilies.sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }

    return left[0].localeCompare(right[0], "ko");
  });

  return rankedFamilies[0]?.[0] ?? "cloud";
}

function computeRarityScore(ingredients: Ingredient[]) {
  const baseScore = ingredients.reduce((sum, ingredient) => sum + ingredient.rank, 0);
  const familyCount = Object.values(countFamilies(ingredients));
  const dominantFamilyBonus = familyCount.length > 0 ? Math.max(...familyCount) - 1 : 0;
  const duplicateCategoryBonus =
    ingredients.length - new Set(ingredients.map((ingredient) => ingredient.category)).size;

  return baseScore + dominantFamilyBonus + duplicateCategoryBonus;
}

function classifyRarity(score: number): Rarity {
  if (score >= 10) {
    return "legendary";
  }
  if (score >= 8) {
    return "epic";
  }
  if (score >= 6) {
    return "rare";
  }
  return "common";
}

function buildRecipeTitle(ingredients: Ingredient[]) {
  return `${sortForTitle(ingredients)
    .map((ingredient) => ingredient.short)
    .join(" ")} 컵케이크`;
}

function buildRecipeDescription(ingredients: Ingredient[], collectionLabel: string) {
  return `${ingredients.map((ingredient) => ingredient.name).join(", ")} 조합으砜 완성한 ${collectionLabel} 시그니처 컵케이크.`;
}

function getIngredientOrThrow(ingredientId: string) {
  const ingredient = INGREDIENT_MAP.get(ingredientId);
  if (!ingredient) {
    throw new Error(`Unknown ingredient: ${ingredientId}`);
  }

  return ingredient;
}

function getIngredientsOrThrow(ingredientIds: string[]) {
  return ingredientIds.map((ingredientId) => getIngredientOrThrow(ingredientId));
}

function buildRecipePalette(ingredients: Ingredient[], rarity: Rarity, collection: IngredientFamily): RecipePalette {
  const batter = ingredients.find((ingredient) => ingredient.category === "batter") ?? ingredients[0];
  const cream = ingredients.find((ingredient) => ingredient.category === "cream") ?? ingredients[1] ?? batter;
  const topping =
    ingredients.find((ingredient) => ingredient.category === "topping") ?? ingredients[2] ?? cream;
  const finisher =
    ingredients.find((ingredient) => ingredient.category === "finisher") ?? ingredients[3] ?? topping;

  return {
    wrapper: batter.accent,
    cake: batter.color,
    cream: cream.color,
    frostingAccent: cream.accent,
    topping: topping.color,
    topperAccent: topping.accent,
    finish: finisher.color,
    finishAccent: finisher.accent,
    rarity: RARITY_META[rarity].accent,
    collection: COLLECTION_META[collection].accent,
  };
}

function buildMixKey(ingredientIds: string[]) {
  return [...ingredientIds].sort((left, right) => left.localeCompare(right, "en")).join("__");
}

function createRecipe(seed: LegacyRecipeSeed, index: number): Recipe {
  const ingredients = getIngredientsOrThrow(seed.ingredientIds);
  const collection = pickDominantFamily(ingredients);
  const rarity = classifyRarity(computeRarityScore(ingredients));

  return {
    id: seed.id,
    index,
    name: buildRecipeTitle(ingredients),
    description: buildRecipeDescription(ingredients, COLLECTION_META[collection].label),
    collection,
    collectionLabel: COLLECTION_META[collection].label,
    rarity,
    rarityLabel: RARITY_META[rarity].label,
    ingredientIds: [...seed.ingredientIds],
    mixKey: buildMixKey(seed.ingredientIds),
    ingredients: sortByCategoryOrder(ingredients),
    palette: buildRecipePalette(ingredients, rarity, collection),
  };
}

function buildLegacyRecipeSeeds() {
  const seeds: LegacyRecipeSeed[] = [];

  for (const batter of BATTERS) {
    for (const cream of CREAMS) {
      for (const topping of TOPPINGS) {
        for (const finisher of FINISHERS) {
          seeds.push({
            id: `${batter.id}__${cream.id}__${topping.id}__${finisher.id}`,
            ingredientIds: [batter.id, cream.id, topping.id, finisher.id],
          });
        }
      }
    }
  }

  return seeds;
}

const RECIPES: Recipe[] = buildLegacyRecipeSeeds().map((seed, index) => createRecipe(seed, index));
const RECIPE_MAP = new Map<string, Recipe>(RECIPES.map((recipe) => [recipe.id, recipe]));

const CUPCAKE_RECIPE_RULES: CupcakeRecipeRule[] = RECIPES.map((recipe) => ({
  id: recipe.id,
  ingredientIds: [...recipe.ingredientIds],
  mixKey: recipe.mixKey,
  resultType: "cupcake",
  recipeId: recipe.id,
}));

const CUPCAKE_RECIPE_RULE_MAP = new Map<string, CupcakeRecipeRule>(
  CUPCAKE_RECIPE_RULES.map((rule) => [rule.mixKey, rule]),
);

const FREEFORM_RECIPE_PROTOTYPES: FreeformRecipePrototype[] = [
  {
    id: "berry-duet",
    name: "딸기 리본 듀엣 컵케이크",
    ingredientIds: ["strawberry-fairy", "strawberry-butter"],
    mixKey: buildMixKey(["strawberry-fairy", "strawberry-butter"]),
    notes: "2재료 조합도 데이터로 표현할 수 있게 두 재료 레시피 예시를 추가한다.",
  },
  {
    id: "cloud-promenade",
    name: "구름 산책 컵케이크",
    ingredientIds: ["vanilla-cloud", "milk-cloud", "bunny-marshmallow"],
    mixKey: buildMixKey(["vanilla-cloud", "milk-cloud", "bunny-marshmallow"]),
    notes: "3재료 조합에서 같은 테마 재료가 이어지는 구조 예시다.",
  },
  {
    id: "twilight-library",
    name: "황혼 서고 컵케이크",
    ingredientIds: ["choco-puff", "caramel-ribbon", "cookie-star", "stardust"],
    mixKey: buildMixKey(["choco-puff", "caramel-ribbon", "cookie-star", "stardust"]),
    notes: "현재 4파트 구조와 호환되는 자유 조합 레시피 예시다.",
  },
  {
    id: "festival-medley",
    name: "축제 메들리 컵케이크",
    ingredientIds: [
      "strawberry-fairy",
      "milk-cloud",
      "heart-sprinkle",
      "pink-ribbon",
      "sparkle-sugar",
    ],
    mixKey: buildMixKey([
      "strawberry-fairy",
      "milk-cloud",
      "heart-sprinkle",
      "pink-ribbon",
      "sparkle-sugar",
    ]),
    notes: "5재료 조합과 중복 카테고리 입력을 함께 표현하는 예시다.",
  },
];

const INGREDIENT_UPGRADE_RULES: IngredientUpgradeRule[] = [
  {
    id: "upgrade-cream-cheese",
    ingredientIds: ["vanilla-cloud", "milk-cloud"],
    mixKey: buildMixKey(["vanilla-cloud", "milk-cloud"]),
    resultType: "ingredient",
    ingredientId: "cream-cheese",
    resultRank: 2,
  },
  {
    id: "upgrade-bunny-marshmallow",
    ingredientIds: ["vanilla-cloud", "milk-cloud", "pink-ribbon"],
    mixKey: buildMixKey(["vanilla-cloud", "milk-cloud", "pink-ribbon"]),
    resultType: "ingredient",
    ingredientId: "bunny-marshmallow",
    resultRank: 2,
  },
  {
    id: "upgrade-cotton-candy",
    ingredientIds: ["vanilla-cloud", "heart-sprinkle", "pink-ribbon"],
    mixKey: buildMixKey(["vanilla-cloud", "heart-sprinkle", "pink-ribbon"]),
    resultType: "ingredient",
    ingredientId: "cotton-candy",
    resultRank: 2,
  },
  {
    id: "upgrade-cookie-star",
    ingredientIds: ["choco-puff", "heart-sprinkle", "sparkle-sugar"],
    mixKey: buildMixKey(["choco-puff", "heart-sprinkle", "sparkle-sugar"]),
    resultType: "ingredient",
    ingredientId: "cookie-star",
    resultRank: 2,
  },
  {
    id: "upgrade-flower-candy",
    ingredientIds: ["strawberry-fairy", "strawberry-butter", "pink-ribbon"],
    mixKey: buildMixKey(["strawberry-fairy", "strawberry-butter", "pink-ribbon"]),
    resultType: "ingredient",
    ingredientId: "flower-candy",
    resultRank: 2,
  },
  {
    id: "upgrade-stardust",
    ingredientIds: ["heart-sprinkle", "sparkle-sugar"],
    mixKey: buildMixKey(["heart-sprinkle", "sparkle-sugar"]),
    resultType: "ingredient",
    ingredientId: "stardust",
    resultRank: 2,
  },
];

const INGREDIENT_UPGRADE_RULE_MAP = new Map<string, IngredientUpgradeRule>(
  INGREDIENT_UPGRADE_RULES.map((rule) => [rule.mixKey, rule]),
);

const FALLBACK_RESULT_POOLS: Record<IngredientRank, FallbackResultPool> = {
  1: {
    rank: 1,
    ingredientIds: ALL_INGREDIENTS.filter((ingredient) => ingredient.rank === 1).map((ingredient) => ingredient.id),
  },
  2: {
    rank: 2,
    ingredientIds: ALL_INGREDIENTS.filter((ingredient) => ingredient.rank === 2).map((ingredient) => ingredient.id),
  },
};

function getIngredientIdsFromSelection(selection: Selection) {
  return LEGACY_CATEGORY_ORDER.flatMap((categoryId) => {
    const ingredientId = selection[categoryId];
    return ingredientId ? [ingredientId] : [];
  });
}

function getRecipeIdFromSelection(selection: Selection) {
  const ingredientIds = getIngredientIdsFromSelection(selection);
  if (ingredientIds.length !== LEGACY_CATEGORY_ORDER.length) {
    return null;
  }

  return getRecipeFromIngredientIds(ingredientIds)?.id ?? null;
}

function getRecipeFromSelection(selection: Selection): Recipe | null {
  const ingredientIds = getIngredientIdsFromSelection(selection);
  if (ingredientIds.length !== LEGACY_CATEGORY_ORDER.length) {
    return null;
  }

  return getRecipeFromIngredientIds(ingredientIds);
}

function getRecipeFromIngredientIds(ingredientIds: string[]) {
  const mixKey = buildMixKey(ingredientIds);
  const rule = CUPCAKE_RECIPE_RULE_MAP.get(mixKey);

  return rule ? RECIPE_MAP.get(rule.recipeId) ?? null : null;
}

function getIngredientUpgradeFromIngredientIds(ingredientIds: string[]) {
  return INGREDIENT_UPGRADE_RULE_MAP.get(buildMixKey(ingredientIds)) ?? null;
}

function getIngredientRankById(ingredientId: string) {
  return INGREDIENT_MAP.get(ingredientId)?.rank ?? null;
}

function getDominantIngredientRank(ingredientIds: string[]): IngredientRank {
  const ranks = ingredientIds
    .map((ingredientId) => getIngredientRankById(ingredientId))
    .filter((rank): rank is IngredientRank => rank !== null);

  if (ranks.length === 0) {
    return 1;
  }

  const averageRank = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
  return averageRank >= 1.5 ? 2 : 1;
}

function getFallbackResultPoolByRank(rank: IngredientRank) {
  return FALLBACK_RESULT_POOLS[rank];
}

function getFallbackResultPoolForIngredientIds(ingredientIds: string[]) {
  return getFallbackResultPoolByRank(getDominantIngredientRank(ingredientIds));
}

function hashString(value: string) {
  return Array.from(value).reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) % 2147483647, 7);
}

function getDailyRecipe(dateKey: string): Recipe {
  const index = hashString(dateKey) % RECIPES.length;
  return RECIPES[index];
}

export {
  ALL_INGREDIENTS,
  BATTERS,
  CATEGORY_META,
  COLLECTION_META,
  CREAMS,
  CUPCAKE_RECIPE_RULES,
  FALLBACK_RESULT_POOLS,
  FINISHERS,
  FREEFORM_RECIPE_PROTOTYPES,
  INGREDIENT_GROUPS,
  INGREDIENT_MAP,
  INGREDIENT_RANK_META,
  INGREDIENT_UPGRADE_RULES,
  RARITY_META,
  RECIPES,
  RECIPE_MAP,
  TOPPINGS,
  buildMixKey,
  getDailyRecipe,
  getDominantIngredientRank,
  getFallbackResultPoolByRank,
  getFallbackResultPoolForIngredientIds,
  getIngredientRankById,
  getIngredientUpgradeFromIngredientIds,
  getRecipeFromIngredientIds,
  getRecipeFromSelection,
  getRecipeIdFromSelection,
};
