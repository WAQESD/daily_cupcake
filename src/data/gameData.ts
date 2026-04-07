import type {
  CategoryId,
  CategoryMeta,
  CollectionMetaEntry,
  FallbackIngredientPool,
  Ingredient,
  IngredientFamily,
  IngredientRank,
  IngredientRankMetaEntry,
  IngredientUpgradeRecipe,
  Rarity,
  RarityMetaEntry,
  Recipe,
  RecipePalette,
} from "../types/game";

type FreeformCupcakeRecipeSpec = {
  id: string;
  name: string;
  description: string;
  ingredientIds: string[];
};

type IngredientUpgradeRecipeSpec = {
  id: string;
  ingredientIds: string[];
  resultIngredientId: string;
  note: string;
};

const BATTERS: Ingredient[] = [
  {
    id: "vanilla-cloud",
    category: "batter",
    name: "바닐라 구름 반죽",
    short: "바닐라",
    family: "cloud",
    rank: "base",
    rarity: 1,
    dropWeight: 8,
    color: "#ffd6b5",
    accent: "#fff4de",
  },
  {
    id: "choco-puff",
    category: "batter",
    name: "초코 퍼프 반죽",
    short: "초코",
    family: "cocoa",
    rank: "base",
    rarity: 1,
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
    rank: "base",
    rarity: 1,
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
    rank: "refined",
    rarity: 2,
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
    rank: "refined",
    rarity: 2,
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
    short: "우유구름",
    family: "cloud",
    rank: "base",
    rarity: 1,
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
    rank: "base",
    rarity: 1,
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
    rank: "refined",
    rarity: 2,
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
    rank: "refined",
    rarity: 2,
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
    rank: "refined",
    rarity: 2,
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
    rank: "base",
    rarity: 1,
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
    rank: "base",
    rarity: 1,
    dropWeight: 8,
    color: "#ff94c2",
    accent: "#ffe7f3",
  },
  {
    id: "bunny-marshmallow",
    category: "topping",
    name: "토끼 마시멜로 토핑",
    short: "토끼",
    family: "cloud",
    rank: "refined",
    rarity: 2,
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
    rank: "refined",
    rarity: 2,
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
    rank: "refined",
    rarity: 2,
    dropWeight: 5,
    color: "#8898ff",
    accent: "#e6ebff",
  },
];

const FINISHERS: Ingredient[] = [
  {
    id: "pink-ribbon",
    category: "finisher",
    name: "분홍 리본 마무리",
    short: "리본",
    family: "berry",
    rank: "base",
    rarity: 1,
    dropWeight: 8,
    color: "#ff8fb8",
    accent: "#fff0f6",
  },
  {
    id: "sparkle-sugar",
    category: "finisher",
    name: "반짝 슈가 마무리",
    short: "반짝",
    family: "star",
    rank: "base",
    rarity: 1,
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
    rank: "refined",
    rarity: 2,
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
    rank: "refined",
    rarity: 2,
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
    rank: "refined",
    rarity: 2,
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

const INGREDIENT_RANK_META: Record<IngredientRank, IngredientRankMetaEntry> = {
  base: {
    label: "기본 등급",
    description: "배달 상자에서 자주 얻고 자유 조합의 출발점이 되는 재료",
  },
  refined: {
    label: "승급 등급",
    description: "특정 조합이나 희귀 상자에서 얻는 상위 재료",
  },
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
const INGREDIENT_MAP: Map<string, Ingredient> = new Map(
  ALL_INGREDIENTS.map((ingredient) => [ingredient.id, ingredient]),
);

function pickDominantFamily(ingredients: Ingredient[]): IngredientFamily {
  const familyCount = ingredients.reduce<Map<IngredientFamily, number>>((accumulator, ingredient) => {
    accumulator.set(ingredient.family, (accumulator.get(ingredient.family) ?? 0) + 1);
    return accumulator;
  }, new Map<IngredientFamily, number>());

  return [...familyCount.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }
    return left[0].localeCompare(right[0], "ko");
  })[0]?.[0] ?? "cloud";
}

function computeLegacyRarityScore(parts: Ingredient[]) {
  const baseScore = parts.reduce((sum, item) => sum + item.rarity, 0);
  let synergy = 0;

  if (parts[0]?.family === parts[1]?.family) {
    synergy += 2;
  }
  if (parts[2]?.family === parts[3]?.family) {
    synergy += 2;
  }

  const familyCount = parts.reduce<Map<IngredientFamily, number>>((accumulator, item) => {
    accumulator.set(item.family, (accumulator.get(item.family) ?? 0) + 1);
    return accumulator;
  }, new Map<IngredientFamily, number>());

  const dominantCount = Math.max(...familyCount.values(), 1);
  synergy += dominantCount - 1;
  return baseScore + synergy;
}

function computeMixingRarityScore(ingredients: Ingredient[]) {
  const baseScore = ingredients.reduce((sum, ingredient) => sum + ingredient.rarity, 0);
  const familyCount = ingredients.reduce<Map<IngredientFamily, number>>((accumulator, ingredient) => {
    accumulator.set(ingredient.family, (accumulator.get(ingredient.family) ?? 0) + 1);
    return accumulator;
  }, new Map<IngredientFamily, number>());

  const dominantCount = Math.max(...familyCount.values(), 1);
  const uniqueCategories = new Set(ingredients.map((ingredient) => ingredient.category)).size;
  return baseScore + (dominantCount - 1) + Math.max(0, uniqueCategories - 2);
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

function buildLegacyRecipeDescription(
  batter: Ingredient,
  cream: Ingredient,
  topping: Ingredient,
  finisher: Ingredient,
  collectionLabel: string,
) {
  return `${batter.name} 위에 ${cream.name}을 풍성하게 올리고 ${topping.name}와 ${finisher.name}로 마무리한 ${collectionLabel} 시그니처 컵케이크.`;
}

function buildLegacyRecipeTitle(
  batter: Ingredient,
  cream: Ingredient,
  topping: Ingredient,
  finisher: Ingredient,
) {
  return `${finisher.short} ${cream.short} ${batter.short} ${topping.short} 컵케이크`;
}

function buildPaletteFromIngredients(
  ingredients: Ingredient[],
  rarity = classifyRarity(computeMixingRarityScore(ingredients)),
  collection = pickDominantFamily(ingredients),
): RecipePalette {
  const batter = ingredients.find((ingredient) => ingredient.category === "batter") ?? ingredients[0];
  const cream = ingredients.find((ingredient) => ingredient.category === "cream") ?? ingredients[1] ?? ingredients[0];
  const topping =
    ingredients.find((ingredient) => ingredient.category === "topping") ?? ingredients.at(-1) ?? ingredients[0];
  const finisher =
    ingredients.find((ingredient) => ingredient.category === "finisher") ?? ingredients.at(-1) ?? ingredients[0];

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

function buildLegacyRecipes(startIndex = 0) {
  const recipes: Recipe[] = [];
  let index = startIndex;

  BATTERS.forEach((batter) => {
    CREAMS.forEach((cream) => {
      TOPPINGS.forEach((topping) => {
        FINISHERS.forEach((finisher) => {
          const parts = [batter, cream, topping, finisher];
          const dominantFamily = pickDominantFamily(parts);
          const collection = COLLECTION_META[dominantFamily];
          const rarityScore = computeLegacyRarityScore(parts);
          const rarity = classifyRarity(rarityScore);

          recipes.push({
            id: `${batter.id}__${cream.id}__${topping.id}__${finisher.id}`,
            index,
            kind: "legacy",
            name: buildLegacyRecipeTitle(batter, cream, topping, finisher),
            description: buildLegacyRecipeDescription(
              batter,
              cream,
              topping,
              finisher,
              collection.label,
            ),
            collection: dominantFamily,
            collectionLabel: collection.label,
            rarity,
            rarityLabel: RARITY_META[rarity].label,
            ingredientIds: parts.map((ingredient) => ingredient.id),
            ingredients: parts,
            palette: buildPaletteFromIngredients(parts, rarity, dominantFamily),
          });

          index += 1;
        });
      });
    });
  });

  return recipes;
}

function resolveIngredients(ingredientIds: string[]) {
  return ingredientIds.map((ingredientId) => {
    const ingredient = INGREDIENT_MAP.get(ingredientId);
    if (!ingredient) {
      throw new Error(`Unknown ingredient id: ${ingredientId}`);
    }
    return ingredient;
  });
}

function createMixingKey(ingredientIds: string[]) {
  return [...ingredientIds].sort((left, right) => left.localeCompare(right, "en")).join("::");
}

function buildMixingCupcakeRecipe(spec: FreeformCupcakeRecipeSpec, index: number): Recipe {
  const ingredients = resolveIngredients(spec.ingredientIds);
  const collection = pickDominantFamily(ingredients);
  const rarity = classifyRarity(computeMixingRarityScore(ingredients));

  return {
    id: spec.id,
    index,
    kind: "mixing",
    name: spec.name,
    description: spec.description,
    collection,
    collectionLabel: COLLECTION_META[collection].label,
    rarity,
    rarityLabel: RARITY_META[rarity].label,
    ingredientIds: [...spec.ingredientIds],
    ingredients,
    palette: buildPaletteFromIngredients(ingredients, rarity, collection),
  };
}

function buildIngredientUpgradeRecipe(spec: IngredientUpgradeRecipeSpec): IngredientUpgradeRecipe {
  const ingredients = resolveIngredients(spec.ingredientIds);
  const resultIngredient = INGREDIENT_MAP.get(spec.resultIngredientId);

  if (!resultIngredient) {
    throw new Error(`Unknown upgrade result ingredient id: ${spec.resultIngredientId}`);
  }

  return {
    id: spec.id,
    ingredientIds: [...spec.ingredientIds],
    ingredients,
    resultIngredientId: spec.resultIngredientId,
    resultRank: resultIngredient.rank,
    note: spec.note,
  };
}

const FREEFORM_CUPCAKE_RECIPE_SPECS: FreeformCupcakeRecipeSpec[] = [
  {
    id: "cloud-blanket-shortcake",
    name: "구름 담요 쇼트케이크",
    description: "바닐라 구름 반죽과 우유 구름 크림만으로 폭신함을 끝까지 밀어붙인 가장 단순한 자유 조합 컵케이크.",
    ingredientIds: ["vanilla-cloud", "milk-cloud"],
  },
  {
    id: "berry-ribbon-party",
    name: "베리 리본 파티 컵케이크",
    description: "딸기 계열 재료를 정석적으로 쌓아 올린 기본형 축제 조합.",
    ingredientIds: ["strawberry-fairy", "strawberry-butter", "cherry-bloom", "pink-ribbon"],
  },
  {
    id: "cocoa-caramel-comet",
    name: "코코아 카라멜 혜성 컵케이크",
    description: "초코 퍼프에 카라멜과 쿠키별을 더해 고소한 살롱 계열 맛을 만드는 3재료 조합.",
    ingredientIds: ["choco-puff", "caramel-ribbon", "cookie-star"],
  },
  {
    id: "dream-parade-float",
    name: "드림 퍼레이드 플로트",
    description: "솜사탕 크림 위에 두 가지 토핑을 겹쳐 올리는, 카테고리 고정 슬롯을 벗어난 퍼레이드형 조합.",
    ingredientIds: ["cotton-candy", "heart-sprinkle", "bunny-marshmallow", "sparkle-sugar"],
  },
  {
    id: "forest-garden-picnic",
    name: "숲속 피크닉 가든 컵케이크",
    description: "말차 숲, 크림치즈, 꽃잎, 토끼 마시멜로, 허니 시럽을 모두 사용하는 5재료 확장 조합.",
    ingredientIds: [
      "matcha-forest",
      "cream-cheese",
      "flower-candy",
      "bunny-marshmallow",
      "honey-drizzle",
    ],
  },
  {
    id: "moonlit-mist-note",
    name: "별빛 안개 노트 컵케이크",
    description: "우유 구름 크림과 블루베리 진주, 별가루만으로 차가운 밤 공기를 표현한 3재료 조합.",
    ingredientIds: ["milk-cloud", "blueberry-pearl", "stardust"],
  },
  {
    id: "sunbeam-cookie-brulee",
    name: "햇살 쿠키 브륄레 컵케이크",
    description: "레몬 선샤인 반죽에 쿠키별과 허니 시럽을 더해 밝은 오후 톤을 만드는 가벼운 조합.",
    ingredientIds: ["lemon-sun", "cookie-star", "honey-drizzle"],
  },
  {
    id: "garden-ribbon-sonata",
    name: "가든 리본 소나타 컵케이크",
    description: "크림치즈와 꽃잎, 체리, 리본을 묶어 정원 계열 디저트를 완성하는 안정적인 4재료 조합.",
    ingredientIds: ["cream-cheese", "flower-candy", "pink-ribbon", "cherry-bloom"],
  },
];

const INGREDIENT_UPGRADE_RECIPE_SPECS: IngredientUpgradeRecipeSpec[] = [
  {
    id: "upgrade-cloud-marshmallow",
    ingredientIds: ["vanilla-cloud", "milk-cloud", "sparkle-sugar"],
    resultIngredientId: "bunny-marshmallow",
    note: "구름 계열 기본 재료를 폭신한 상위 토핑으로 승급한다.",
  },
  {
    id: "upgrade-garden-cream",
    ingredientIds: ["vanilla-cloud", "milk-cloud", "pink-ribbon"],
    resultIngredientId: "cream-cheese",
    note: "부드러운 기본 조합을 진한 크림 계열 상위 재료로 전환한다.",
  },
  {
    id: "upgrade-cocoa-ribbon",
    ingredientIds: ["choco-puff", "milk-cloud", "pink-ribbon"],
    resultIngredientId: "caramel-ribbon",
    note: "코코아 계열 반죽을 달콤한 리본 크림으로 승급한다.",
  },
  {
    id: "upgrade-star-cookie",
    ingredientIds: ["vanilla-cloud", "heart-sprinkle", "sparkle-sugar"],
    resultIngredientId: "cookie-star",
    note: "가벼운 장식 조합을 단단한 상위 토핑으로 굳힌다.",
  },
  {
    id: "upgrade-berry-bloom",
    ingredientIds: ["strawberry-fairy", "strawberry-butter", "cherry-bloom"],
    resultIngredientId: "flower-candy",
    note: "베리 조합을 꽃잎 마무리 계열 상위 재료로 승급한다.",
  },
  {
    id: "upgrade-sun-syrup",
    ingredientIds: ["lemon-sun", "milk-cloud", "sparkle-sugar"],
    resultIngredientId: "honey-drizzle",
    note: "밝은 반죽 조합을 점성이 있는 허니 시럽 마무리로 응축한다.",
  },
];

const RECIPES: Recipe[] = FREEFORM_CUPCAKE_RECIPE_SPECS.map((spec, index) =>
  buildMixingCupcakeRecipe(spec, index),
);
const ACTIVE_RECIPE_IDS = new Set(RECIPES.map((recipe) => recipe.id));
const LEGACY_RECIPES: Recipe[] = buildLegacyRecipes(RECIPES.length);
const RECIPE_MAP: Map<string, Recipe> = new Map([...RECIPES, ...LEGACY_RECIPES].map((recipe) => [recipe.id, recipe]));

const FREEFORM_CUPCAKE_RECIPE_MAP = new Map(
  RECIPES.map((recipe) => [createMixingKey(recipe.ingredientIds), recipe]),
);

const INGREDIENT_UPGRADE_RECIPES: IngredientUpgradeRecipe[] = INGREDIENT_UPGRADE_RECIPE_SPECS.map((spec) =>
  buildIngredientUpgradeRecipe(spec),
);
const INGREDIENT_UPGRADE_RECIPE_MAP = new Map(
  INGREDIENT_UPGRADE_RECIPES.map((recipe) => [createMixingKey(recipe.ingredientIds), recipe]),
);

const FALLBACK_INGREDIENT_POOLS: FallbackIngredientPool[] = [
  {
    rank: "base",
    ingredientIds: ALL_INGREDIENTS.filter((ingredient) => ingredient.rank === "base").map(
      (ingredient) => ingredient.id,
    ),
    note: "정의된 조합표에 맞지 않으면 기본 등급 재료끼리 같은 등급 후보군에서 랜덤 결과를 고른다.",
  },
  {
    rank: "refined",
    ingredientIds: ALL_INGREDIENTS.filter((ingredient) => ingredient.rank === "refined").map(
      (ingredient) => ingredient.id,
    ),
    note: "상위 재료가 섞인 경우에도 결과 예측 가능성을 위해 동일 등급 후보군 안에서만 fallback 한다.",
  },
];
const FALLBACK_INGREDIENT_POOL_MAP = new Map(
  FALLBACK_INGREDIENT_POOLS.map((pool) => [pool.rank, pool]),
);

function getFreeformCupcakeRecipe(ingredientIds: string[]) {
  return FREEFORM_CUPCAKE_RECIPE_MAP.get(createMixingKey(ingredientIds)) ?? null;
}

function getIngredientUpgradeRecipe(ingredientIds: string[]) {
  return INGREDIENT_UPGRADE_RECIPE_MAP.get(createMixingKey(ingredientIds)) ?? null;
}

function getFallbackIngredientPool(rank: IngredientRank) {
  return FALLBACK_INGREDIENT_POOL_MAP.get(rank) ?? null;
}

function hashString(value: string) {
  return Array.from(value).reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) % 2147483647;
  }, 7);
}

function getDailyRecipe(dateKey: string): Recipe {
  const index = hashString(dateKey) % RECIPES.length;
  return RECIPES[index];
}

export {
  ACTIVE_RECIPE_IDS,
  ALL_INGREDIENTS,
  BATTERS,
  CATEGORY_META,
  COLLECTION_META,
  CREAMS,
  FALLBACK_INGREDIENT_POOLS,
  FINISHERS,
  INGREDIENT_GROUPS,
  INGREDIENT_MAP,
  INGREDIENT_RANK_META,
  INGREDIENT_UPGRADE_RECIPES,
  LEGACY_RECIPES,
  RARITY_META,
  RECIPES,
  RECIPE_MAP,
  TOPPINGS,
  createMixingKey,
  getDailyRecipe,
  getFallbackIngredientPool,
  getFreeformCupcakeRecipe,
  getIngredientUpgradeRecipe,
};
