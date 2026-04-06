// @ts-nocheck

import type {
  CategoryId,
  CategoryMeta,
  CollectionMetaEntry,
  Ingredient,
  IngredientFamily,
  Rarity,
  RarityMetaEntry,
  Recipe,
  Selection,
} from "../types/game";

const BATTERS: Ingredient[] = [
  {
    id: "vanilla-cloud",
    category: "batter",
    name: "바닐라 구름 반죽",
    short: "바닐라",
    family: "cloud",
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

function pickDominantFamily(families) {
  const familyCount = families.reduce((accumulator, family) => {
    accumulator[family] = (accumulator[family] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(familyCount).sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }
    return left[0].localeCompare(right[0], "ko");
  })[0][0];
}

function computeRarityScore(parts) {
  const baseScore = parts.reduce((sum, item) => sum + item.rarity, 0);
  let synergy = 0;

  if (parts[0].family === parts[1].family) {
    synergy += 2;
  }
  if (parts[2].family === parts[3].family) {
    synergy += 2;
  }

  const familyCount = parts.reduce((accumulator, item) => {
    accumulator[item.family] = (accumulator[item.family] ?? 0) + 1;
    return accumulator;
  }, {});

  synergy += Math.max(...Object.values(familyCount)) - 1;
  return baseScore + synergy;
}

function classifyRarity(score) {
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

function buildRecipeDescription(batter, cream, topping, finisher, collectionLabel) {
  return `${batter.name} 위에 ${cream.name}을 풍성하게 올리고 ${topping.name}와 ${finisher.name}로 마무리한 ${collectionLabel} 시그니처 컵케이크.`;
}

function buildRecipeTitle(batter, cream, topping, finisher) {
  return `${finisher.short} ${cream.short} ${batter.short} ${topping.short} 컵케이크`;
}

function buildRecipes() {
  const recipes = [];
  let index = 0;

  BATTERS.forEach((batter) => {
    CREAMS.forEach((cream) => {
      TOPPINGS.forEach((topping) => {
        FINISHERS.forEach((finisher) => {
          const parts = [batter, cream, topping, finisher];
          const dominantFamily = pickDominantFamily(parts.map((item) => item.family));
          const collection = COLLECTION_META[dominantFamily];
          const rarityScore = computeRarityScore(parts);
          const rarity = classifyRarity(rarityScore);

          recipes.push({
            id: `${batter.id}__${cream.id}__${topping.id}__${finisher.id}`,
            index,
            name: buildRecipeTitle(batter, cream, topping, finisher),
            description: buildRecipeDescription(
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
            ingredientIds: {
              batter: batter.id,
              cream: cream.id,
              topping: topping.id,
              finisher: finisher.id,
            },
            ingredients: parts,
            palette: {
              wrapper: batter.accent,
              cake: batter.color,
              cream: cream.color,
              frostingAccent: cream.accent,
              topping: topping.color,
              topperAccent: topping.accent,
              finish: finisher.color,
              finishAccent: finisher.accent,
              rarity: RARITY_META[rarity].accent,
              collection: collection.accent,
            },
          });

          index += 1;
        });
      });
    });
  });

  return recipes;
}

const RECIPES: Recipe[] = buildRecipes();
const RECIPE_MAP: Map<string, Recipe> = new Map(RECIPES.map((recipe) => [recipe.id, recipe]));

function getRecipeIdFromSelection(selection: Selection) {
  if (!selection.batter || !selection.cream || !selection.topping || !selection.finisher) {
    return null;
  }

  return `${selection.batter}__${selection.cream}__${selection.topping}__${selection.finisher}`;
}

function getRecipeFromSelection(selection: Selection): Recipe | null {
  const recipeId = getRecipeIdFromSelection(selection);
  return recipeId ? RECIPE_MAP.get(recipeId) ?? null : null;
}

function hashString(value) {
  return Array.from(value).reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) % 2147483647;
  }, 7);
}

function getDailyRecipe(dateKey: string): Recipe {
  const index = hashString(dateKey) % RECIPES.length;
  return RECIPES[index];
}

export {
  ALL_INGREDIENTS,
  CATEGORY_META,
  COLLECTION_META,
  FINISHERS,
  INGREDIENT_GROUPS,
  INGREDIENT_MAP,
  RARITY_META,
  RECIPES,
  RECIPE_MAP,
  TOPPINGS,
  BATTERS,
  CREAMS,
  getDailyRecipe,
  getRecipeFromSelection,
  getRecipeIdFromSelection,
};
