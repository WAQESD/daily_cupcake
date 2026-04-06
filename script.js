import {
  ALL_INGREDIENTS,
  CATEGORY_META,
  COLLECTION_META,
  INGREDIENT_GROUPS,
  INGREDIENT_MAP,
  RARITY_META,
  RECIPES,
  getDailyRecipe,
  getRecipeFromSelection,
} from "./data.js";

const STORAGE_KEY = "cupcake-village-save-v1";
const DELIVERY_MS = 90 * 1000;
const MAX_PENDING_BOXES = 12;
const BOXES_PER_DAILY_GIFT = 3;
const SHOWCASE_LIMIT = 6;
const DAILY_TIMEZONE = "Asia/Seoul";

const DEFAULT_STATE = {
  inventory: {},
  selection: {
    batter: null,
    cream: null,
    topping: null,
    finisher: null,
  },
  discoveredRecipeIds: [],
  collection: {},
  favorites: [],
  pendingBoxes: 3,
  lastDeliveryResolvedAt: Date.now(),
  lastDailyClaimDate: "",
  dailyStreak: 0,
  lastDailyChallengeDate: "",
  lastCraftedRecipeId: null,
};

const uiState = {
  deliveryMessage: "처음 온 상자 3개가 준비되어 있어요. 바로 열어서 시작해 보세요.",
  craftMessage: "",
  challengeMessage: "",
};

let state = loadState();

const elements = {
  todayStatus: document.querySelector("#todayStatus"),
  nextDeliveryCountdown: document.querySelector("#nextDeliveryCountdown"),
  dailyGiftButton: document.querySelector("#dailyGiftButton"),
  discoveredCount: document.querySelector("#discoveredCount"),
  discoveryPercent: document.querySelector("#discoveryPercent"),
  craftedCount: document.querySelector("#craftedCount"),
  craftedUniqueCount: document.querySelector("#craftedUniqueCount"),
  pendingBoxesCount: document.querySelector("#pendingBoxesCount"),
  inventoryTotal: document.querySelector("#inventoryTotal"),
  streakCount: document.querySelector("#streakCount"),
  favoriteCount: document.querySelector("#favoriteCount"),
  claimBoxesButton: document.querySelector("#claimBoxesButton"),
  pendingBoxesLabel: document.querySelector("#pendingBoxesLabel"),
  boxCapLabel: document.querySelector("#boxCapLabel"),
  deliveryMessage: document.querySelector("#deliveryMessage"),
  dailyRecipeCard: document.querySelector("#dailyRecipeCard"),
  dailyChallengeMessage: document.querySelector("#dailyChallengeMessage"),
  ingredientBoard: document.querySelector("#ingredientBoard"),
  craftButton: document.querySelector("#craftButton"),
  clearSelectionButton: document.querySelector("#clearSelectionButton"),
  selectionPreview: document.querySelector("#selectionPreview"),
  craftResult: document.querySelector("#craftResult"),
  rarityFilter: document.querySelector("#rarityFilter"),
  collectionFilter: document.querySelector("#collectionFilter"),
  searchInput: document.querySelector("#searchInput"),
  dexSummary: document.querySelector("#dexSummary"),
  lockedSummary: document.querySelector("#lockedSummary"),
  progressBarFill: document.querySelector("#progressBarFill"),
  dexMatrix: document.querySelector("#dexMatrix"),
  recipeList: document.querySelector("#recipeList"),
  showcaseList: document.querySelector("#showcaseList"),
  craftedList: document.querySelector("#craftedList"),
  resetButton: document.querySelector("#resetButton"),
};

function loadState() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return createInitialState();
    }

    return normalizeState(JSON.parse(storedValue));
  } catch (error) {
    console.error("저장 데이터를 불러오지 못했습니다.", error);
    return createInitialState();
  }
}

function createInitialState() {
  const initialState = structuredClone(DEFAULT_STATE);

  addIngredient(initialState.inventory, "vanilla-cloud", 2);
  addIngredient(initialState.inventory, "milk-cloud", 2);
  addIngredient(initialState.inventory, "cherry-bloom", 2);
  addIngredient(initialState.inventory, "pink-ribbon", 2);
  addIngredient(initialState.inventory, "strawberry-fairy", 1);
  addIngredient(initialState.inventory, "strawberry-butter", 1);
  addIngredient(initialState.inventory, "heart-sprinkle", 1);
  addIngredient(initialState.inventory, "sparkle-sugar", 1);

  return initialState;
}

function normalizeState(rawState) {
  const normalized = structuredClone(DEFAULT_STATE);

  normalized.inventory = Object.fromEntries(
    ALL_INGREDIENTS.map((ingredient) => [ingredient.id, Number(rawState.inventory?.[ingredient.id] ?? 0)]),
  );
  normalized.selection = {
    batter: rawState.selection?.batter ?? null,
    cream: rawState.selection?.cream ?? null,
    topping: rawState.selection?.topping ?? null,
    finisher: rawState.selection?.finisher ?? null,
  };
  normalized.discoveredRecipeIds = Array.isArray(rawState.discoveredRecipeIds)
    ? rawState.discoveredRecipeIds.filter((recipeId) => RECIPES.some((recipe) => recipe.id === recipeId))
    : [];
  normalized.collection = rawState.collection ?? {};
  normalized.favorites = Array.isArray(rawState.favorites) ? rawState.favorites.slice(0, SHOWCASE_LIMIT) : [];
  normalized.pendingBoxes = clamp(Number(rawState.pendingBoxes ?? DEFAULT_STATE.pendingBoxes), 0, MAX_PENDING_BOXES);
  normalized.lastDeliveryResolvedAt = Number(rawState.lastDeliveryResolvedAt ?? Date.now());
  normalized.lastDailyClaimDate = rawState.lastDailyClaimDate ?? "";
  normalized.dailyStreak = Number(rawState.dailyStreak ?? 0);
  normalized.lastDailyChallengeDate = rawState.lastDailyChallengeDate ?? "";
  normalized.lastCraftedRecipeId = rawState.lastCraftedRecipeId ?? null;

  return normalized;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function addIngredient(inventory, ingredientId, amount = 1) {
  inventory[ingredientId] = (inventory[ingredientId] ?? 0) + amount;
}

function subtractIngredient(inventory, ingredientId, amount = 1) {
  inventory[ingredientId] = Math.max(0, (inventory[ingredientId] ?? 0) - amount);
}

function getTodayKey() {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: DAILY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

function getYesterdayKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function weightedPick(items) {
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

function generateDeliveryBox() {
  return CATEGORY_META.map(({ id }) => weightedPick(INGREDIENT_GROUPS[id]).id);
}

function summarizeRewards(ingredientIds) {
  const summary = ingredientIds.reduce((accumulator, ingredientId) => {
    accumulator[ingredientId] = (accumulator[ingredientId] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(summary)
    .map(([ingredientId, amount]) => `${INGREDIENT_MAP.get(ingredientId).name} x${amount}`)
    .join(", ");
}

function applyIngredientReward(ingredientIds) {
  ingredientIds.forEach((ingredientId) => addIngredient(state.inventory, ingredientId, 1));
}

function syncDeliveryBoxes() {
  const now = Date.now();
  if (state.pendingBoxes >= MAX_PENDING_BOXES) {
    return;
  }

  const elapsed = now - state.lastDeliveryResolvedAt;
  if (elapsed < DELIVERY_MS) {
    return;
  }

  const possibleBoxes = Math.floor(elapsed / DELIVERY_MS);
  const availableSpace = MAX_PENDING_BOXES - state.pendingBoxes;
  const generatedBoxes = Math.min(possibleBoxes, availableSpace);

  if (generatedBoxes > 0) {
    state.pendingBoxes += generatedBoxes;
    if (generatedBoxes < possibleBoxes) {
      state.lastDeliveryResolvedAt = now;
    } else {
      state.lastDeliveryResolvedAt += generatedBoxes * DELIVERY_MS;
    }
    saveState();
  }
}

function claimPendingBoxes() {
  syncDeliveryBoxes();

  if (state.pendingBoxes <= 0) {
    uiState.deliveryMessage = "아직 상자가 도착하지 않았어요. 조금만 기다리면 새 상자가 와요.";
    render();
    return;
  }

  const boxesToOpen = state.pendingBoxes;
  const rewards = [];

  for (let count = 0; count < boxesToOpen; count += 1) {
    rewards.push(...generateDeliveryBox());
  }

  applyIngredientReward(rewards);
  state.pendingBoxes = 0;
  state.lastDeliveryResolvedAt = Date.now();
  saveState();

  uiState.deliveryMessage = `${boxesToOpen}상자를 열어 재료를 받았어요. ${summarizeRewards(rewards)}`;
  render();
}

function claimDailyGift() {
  const todayKey = getTodayKey();

  if (state.lastDailyClaimDate === todayKey) {
    uiState.deliveryMessage = "오늘의 데일리 선물은 이미 받았어요. 내일 다시 찾아와 주세요.";
    render();
    return;
  }

  const rewards = [];
  for (let count = 0; count < BOXES_PER_DAILY_GIFT; count += 1) {
    rewards.push(...generateDeliveryBox());
  }
  rewards.push(weightedPick(INGREDIENT_GROUPS.finisher).id);
  rewards.push(weightedPick(INGREDIENT_GROUPS.topping).id);

  applyIngredientReward(rewards);

  state.dailyStreak =
    state.lastDailyClaimDate === getYesterdayKey(todayKey) ? state.dailyStreak + 1 : 1;
  state.lastDailyClaimDate = todayKey;
  saveState();

  uiState.deliveryMessage = `데일리 선물을 받았어요. ${summarizeRewards(rewards)}`;
  render();
}

function hasEnoughIngredientsForSelection(selection) {
  return CATEGORY_META.every(({ id }) => {
    const ingredientId = selection[id];
    return ingredientId && (state.inventory[ingredientId] ?? 0) > 0;
  });
}

function unlockDailyChallengeIfNeeded(recipeId) {
  const todayKey = getTodayKey();
  const todayRecipe = getDailyRecipe(todayKey);

  if (recipeId !== todayRecipe.id || state.lastDailyChallengeDate === todayKey) {
    return;
  }

  const bonus = [...generateDeliveryBox(), weightedPick(INGREDIENT_GROUPS.cream).id];
  applyIngredientReward(bonus);
  state.lastDailyChallengeDate = todayKey;
  uiState.challengeMessage = `오늘의 추천 레시피를 완성해서 보너스를 받았어요. ${summarizeRewards(bonus)}`;
}

function craftCupcake() {
  const recipe = getRecipeFromSelection(state.selection);

  if (!recipe) {
    uiState.craftMessage = "반죽, 크림, 토핑, 마무리를 모두 골라 주세요.";
    render();
    return;
  }

  if (!hasEnoughIngredientsForSelection(state.selection)) {
    uiState.craftMessage = "선택한 재료 수량이 부족해요. 배달 상자를 먼저 열어 주세요.";
    render();
    return;
  }

  CATEGORY_META.forEach(({ id }) => subtractIngredient(state.inventory, state.selection[id], 1));

  const firstDiscovery = !state.discoveredRecipeIds.includes(recipe.id);
  if (firstDiscovery) {
    state.discoveredRecipeIds.push(recipe.id);
  }

  const existingRecord = state.collection[recipe.id] ?? {
    count: 0,
    firstCraftedAt: Date.now(),
    lastCraftedAt: Date.now(),
  };
  existingRecord.count += 1;
  existingRecord.lastCraftedAt = Date.now();
  state.collection[recipe.id] = existingRecord;
  state.lastCraftedRecipeId = recipe.id;

  unlockDailyChallengeIfNeeded(recipe.id);

  uiState.craftMessage = firstDiscovery
    ? `새 레시피를 발견했어요. ${recipe.name} 도감이 열렸어요.`
    : `${recipe.name}를 다시 만들었어요. 진열장에 예쁘게 올려 보세요.`;

  saveState();
  render();
}

function clearSelection() {
  state.selection = {
    batter: null,
    cream: null,
    topping: null,
    finisher: null,
  };
  saveState();
  render();
}

function toggleSelection(categoryId, ingredientId) {
  const currentValue = state.selection[categoryId];
  state.selection[categoryId] = currentValue === ingredientId ? null : ingredientId;
  saveState();
  render();
}

function toggleFavorite(recipeId) {
  const currentFavorites = new Set(state.favorites);

  if (currentFavorites.has(recipeId)) {
    currentFavorites.delete(recipeId);
  } else {
    if (currentFavorites.size >= SHOWCASE_LIMIT) {
      uiState.craftMessage = `진열장은 최대 ${SHOWCASE_LIMIT}종까지 올릴 수 있어요. 먼저 하나를 내려 주세요.`;
      render();
      return;
    }
    currentFavorites.add(recipeId);
  }

  state.favorites = Array.from(currentFavorites);
  saveState();
  render();
}

function resetSave() {
  const confirmed = window.confirm("정말 저장 데이터를 초기화할까요? 도감과 진열장 기록이 모두 지워져요.");
  if (!confirmed) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState();
  uiState.deliveryMessage = "새로 시작했어요. 처음 상자 3개와 스타터 재료를 준비했어요.";
  uiState.craftMessage = "";
  uiState.challengeMessage = "";
  saveState();
  render();
}

function createCupcakeArt(recipe, size = "medium") {
  const toppingLabel = recipe.ingredients[2].short;
  const finishLabel = recipe.ingredients[3].short;

  return `
    <div class="cupcake-art cupcake-art--${size}" style="
      --wrapper-color:${recipe.palette.wrapper};
      --cake-color:${recipe.palette.cake};
      --cream-color:${recipe.palette.cream};
      --cream-accent:${recipe.palette.frostingAccent};
      --topping-color:${recipe.palette.topping};
      --topper-accent:${recipe.palette.topperAccent};
      --finish-color:${recipe.palette.finish};
      --finish-accent:${recipe.palette.finishAccent};
      --rarity-color:${recipe.palette.rarity};
      --collection-color:${recipe.palette.collection};
    ">
      <div class="cupcake-art__sparkle"></div>
      <div class="cupcake-art__finish">${finishLabel}</div>
      <div class="cupcake-art__cream">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="cupcake-art__topping">${toppingLabel}</div>
      <div class="cupcake-art__cake"></div>
      <div class="cupcake-art__wrapper"></div>
    </div>
  `;
}

function createTag(label, modifier = "") {
  return `<span class="tag ${modifier}">${label}</span>`;
}

function renderHeader() {
  const discoveredCount = state.discoveredRecipeIds.length;
  const craftedEntries = Object.values(state.collection);
  const totalCrafted = craftedEntries.reduce((sum, entry) => sum + entry.count, 0);
  const inventoryTotal = Object.values(state.inventory).reduce((sum, amount) => sum + amount, 0);
  const progressPercent = Math.round((discoveredCount / RECIPES.length) * 100);
  const todayKey = getTodayKey();
  const canClaimDailyGift = state.lastDailyClaimDate !== todayKey;

  elements.todayStatus.textContent = canClaimDailyGift
    ? "오늘 선물을 받을 수 있어요"
    : "오늘 선물을 이미 받았어요";
  elements.dailyGiftButton.disabled = !canClaimDailyGift;
  elements.discoveredCount.textContent = `${discoveredCount} / ${RECIPES.length}`;
  elements.discoveryPercent.textContent = `${progressPercent}%`;
  elements.craftedCount.textContent = `${totalCrafted}개`;
  elements.craftedUniqueCount.textContent = `유니크 ${craftedEntries.length}종`;
  elements.pendingBoxesCount.textContent = `${state.pendingBoxes}상자`;
  elements.inventoryTotal.textContent = `재료 ${inventoryTotal}개 보관 중`;
  elements.streakCount.textContent = `${state.dailyStreak}일`;
  elements.favoriteCount.textContent = `진열 중 ${state.favorites.length}종`;
  elements.pendingBoxesLabel.textContent = `현재 ${state.pendingBoxes}상자 대기 중`;
  elements.boxCapLabel.textContent = `최대 ${MAX_PENDING_BOXES}상자까지 보관`;
}

function renderCountdown() {
  if (state.pendingBoxes >= MAX_PENDING_BOXES) {
    elements.nextDeliveryCountdown.textContent = "보관함이 가득 찼어요";
    return;
  }

  const elapsed = Date.now() - state.lastDeliveryResolvedAt;
  const remaining = DELIVERY_MS - (elapsed % DELIVERY_MS);
  elements.nextDeliveryCountdown.textContent = formatCountdown(remaining);
}

function renderDailyRecipe() {
  const todayKey = getTodayKey();
  const recipe = getDailyRecipe(todayKey);
  const completed = state.lastDailyChallengeDate === todayKey;

  elements.dailyRecipeCard.innerHTML = `
    <div class="daily-recipe-card__art">
      ${createCupcakeArt(recipe, "small")}
    </div>
    <div class="daily-recipe-card__copy">
      <strong>${recipe.name}</strong>
      <p>${recipe.ingredients.map((ingredient) => ingredient.name).join(" + ")}</p>
      <div class="daily-recipe-card__tags">
        ${createTag(recipe.collectionLabel)}
        ${createTag(recipe.rarityLabel, "tag--bright")}
      </div>
      <span class="daily-recipe-card__status">${completed ? "오늘 보너스 완료" : "오늘 완성하면 보너스 재료"}</span>
    </div>
  `;

  elements.dailyChallengeMessage.textContent = uiState.challengeMessage;
}

function renderIngredientBoard() {
  elements.ingredientBoard.innerHTML = CATEGORY_META.map(({ id, label, description }) => {
    const ingredients = INGREDIENT_GROUPS[id];

    return `
      <section class="ingredient-group">
        <header class="ingredient-group__header">
          <div>
            <h3>${label}</h3>
            <p>${description}</p>
          </div>
        </header>
        <div class="ingredient-group__grid">
          ${ingredients
            .map((ingredient) => {
              const amount = state.inventory[ingredient.id] ?? 0;
              const selected = state.selection[id] === ingredient.id;
              const unavailable = amount <= 0;

              return `
                <button
                  type="button"
                  class="ingredient-pill ${selected ? "ingredient-pill--selected" : ""}"
                  style="--ingredient-color:${ingredient.color}; --ingredient-accent:${ingredient.accent};"
                  data-action="select-ingredient"
                  data-category="${id}"
                  data-ingredient="${ingredient.id}"
                  ${unavailable ? "disabled" : ""}
                >
                  <span class="ingredient-pill__name">${ingredient.name}</span>
                  <span class="ingredient-pill__meta">${ingredient.short}</span>
                  <span class="ingredient-pill__count">${amount}</span>
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
  }).join("");

  elements.ingredientBoard.querySelectorAll("[data-action='select-ingredient']").forEach((button) => {
    button.addEventListener("click", () => {
      toggleSelection(button.dataset.category, button.dataset.ingredient);
    });
  });
}

function renderSelectionPreview() {
  const recipe = getRecipeFromSelection(state.selection);
  const discovered = recipe && state.discoveredRecipeIds.includes(recipe.id);

  elements.selectionPreview.innerHTML = `
    <div class="selection-grid">
      ${CATEGORY_META.map(({ id, label }) => {
        const ingredient = state.selection[id] ? INGREDIENT_MAP.get(state.selection[id]) : null;
        return `
          <article class="selection-card">
            <span class="selection-card__label">${label}</span>
            <strong>${ingredient ? ingredient.name : "아직 선택 안 함"}</strong>
          </article>
        `;
      }).join("")}
    </div>
    <div class="selection-hint">
      ${
        recipe
          ? discovered
            ? `<strong>알고 있는 레시피</strong><p>${recipe.name}</p>`
            : `<strong>미지의 레시피</strong><p>아직 도감에 없는 새로운 컵케이크가 될지도 몰라요.</p>`
          : `<strong>조합 중</strong><p>네 종류의 재료를 모두 고르면 오븐에 넣을 수 있어요.</p>`
      }
    </div>
    <p class="mix-preview__message">${uiState.craftMessage}</p>
  `;
}

function renderCraftResult() {
  const recipeId = state.lastCraftedRecipeId;

  if (!recipeId || !state.collection[recipeId]) {
    elements.craftResult.className = "result-card result-card--empty";
    elements.craftResult.textContent = "아직 오븐에서 나온 컵케이크가 없어요.";
    return;
  }

  const recipe = RECIPES.find((entry) => entry.id === recipeId);
  const count = state.collection[recipeId].count;
  const isFavorite = state.favorites.includes(recipeId);

  elements.craftResult.className = "result-card";
  elements.craftResult.innerHTML = `
    ${createCupcakeArt(recipe)}
    <div class="result-card__copy">
      <div class="result-card__heading">
        <strong>${recipe.name}</strong>
        <button class="mini-button" data-action="toggle-favorite" data-recipe="${recipe.id}">
          ${isFavorite ? "진열장에서 내리기" : "진열장에 올리기"}
        </button>
      </div>
      <p>${recipe.description}</p>
      <div class="result-card__tags">
        ${createTag(recipe.collectionLabel)}
        ${createTag(recipe.rarityLabel, "tag--bright")}
        ${createTag(`제작 ${count}회`)}
      </div>
    </div>
  `;

  elements.craftResult
    .querySelector("[data-action='toggle-favorite']")
    .addEventListener("click", () => toggleFavorite(recipe.id));
}

function getFilteredRecipes() {
  const rarity = elements.rarityFilter.value;
  const collection = elements.collectionFilter.value;
  const searchText = elements.searchInput.value.trim().toLowerCase();

  return state.discoveredRecipeIds
    .map((recipeId) => RECIPES.find((recipe) => recipe.id === recipeId))
    .filter(Boolean)
    .filter((recipe) => (rarity === "all" ? true : recipe.rarity === rarity))
    .filter((recipe) => (collection === "all" ? true : recipe.collection === collection))
    .filter((recipe) => {
      if (!searchText) {
        return true;
      }

      const haystack = [
        recipe.name,
        recipe.description,
        recipe.collectionLabel,
        ...recipe.ingredients.map((ingredient) => ingredient.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchText);
    })
    .sort((left, right) => {
      const rightCraftedAt = state.collection[right.id]?.lastCraftedAt ?? 0;
      const leftCraftedAt = state.collection[left.id]?.lastCraftedAt ?? 0;
      return rightCraftedAt - leftCraftedAt;
    });
}

function renderDex() {
  const discoveredCount = state.discoveredRecipeIds.length;
  const progressPercent = Math.round((discoveredCount / RECIPES.length) * 100);
  const filteredRecipes = getFilteredRecipes();

  elements.dexSummary.textContent = `${discoveredCount} / ${RECIPES.length} 발견`;
  elements.lockedSummary.textContent = `잠긴 레시피 ${RECIPES.length - discoveredCount}종`;
  elements.progressBarFill.style.width = `${progressPercent}%`;

  const discoveredSet = new Set(state.discoveredRecipeIds);
  elements.dexMatrix.innerHTML = RECIPES.map(
    (recipe) => `
      <span
        class="dex-matrix__cell ${discoveredSet.has(recipe.id) ? "dex-matrix__cell--on" : ""}"
        title="${discoveredSet.has(recipe.id) ? recipe.name : "잠긴 레시피"}"
      ></span>
    `,
  ).join("");

  if (filteredRecipes.length === 0) {
    elements.recipeList.innerHTML = `
      <div class="empty-card">
        아직 조건에 맞는 레시피가 없어요. 새로운 컵케이크를 구워 도감을 채워 보세요.
      </div>
    `;
    return;
  }

  elements.recipeList.innerHTML = filteredRecipes
    .map((recipe) => {
      const craftedCount = state.collection[recipe.id]?.count ?? 0;

      return `
        <article class="recipe-card">
          ${createCupcakeArt(recipe, "small")}
          <div class="recipe-card__copy">
            <div class="recipe-card__header">
              <strong>${recipe.name}</strong>
              <span class="recipe-card__count">제작 ${craftedCount}회</span>
            </div>
            <p>${recipe.description}</p>
            <div class="recipe-card__ingredients">
              ${recipe.ingredients.map((ingredient) => createTag(ingredient.name)).join("")}
            </div>
            <div class="recipe-card__footer">
              ${createTag(recipe.collectionLabel)}
              ${createTag(recipe.rarityLabel, "tag--bright")}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderShowcase() {
  const favoriteRecipes = state.favorites
    .map((recipeId) => RECIPES.find((recipe) => recipe.id === recipeId))
    .filter(Boolean);

  if (favoriteRecipes.length === 0) {
    elements.showcaseList.innerHTML = `
      <div class="empty-card">
        마음에 드는 컵케이크를 진열장에 올려 보세요. 제작 결과 카드나 보관함에서 바로 올릴 수 있어요.
      </div>
    `;
  } else {
    elements.showcaseList.innerHTML = favoriteRecipes
      .map((recipe) => {
        const record = state.collection[recipe.id];
        return `
          <article class="showcase-card">
            ${createCupcakeArt(recipe)}
            <div class="showcase-card__copy">
              <strong>${recipe.name}</strong>
              <p>${recipe.collectionLabel} 분위기의 대표 컵케이크예요.</p>
              <div class="showcase-card__tags">
                ${createTag(recipe.rarityLabel, "tag--bright")}
                ${createTag(`제작 ${record?.count ?? 0}회`)}
              </div>
              <button class="mini-button" data-action="remove-favorite" data-recipe="${recipe.id}">
                진열장에서 내리기
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    elements.showcaseList.querySelectorAll("[data-action='remove-favorite']").forEach((button) => {
      button.addEventListener("click", () => toggleFavorite(button.dataset.recipe));
    });
  }

  const craftedRecipes = Object.entries(state.collection)
    .map(([recipeId, record]) => ({
      recipe: RECIPES.find((entry) => entry.id === recipeId),
      record,
    }))
    .filter(({ recipe }) => Boolean(recipe))
    .sort((left, right) => right.record.lastCraftedAt - left.record.lastCraftedAt);

  if (craftedRecipes.length === 0) {
    elements.craftedList.innerHTML = `
      <div class="empty-card">아직 만든 컵케이크가 없어요. 오븐에서 첫 작품을 구워 보세요.</div>
    `;
    return;
  }

  elements.craftedList.innerHTML = craftedRecipes
    .map(({ recipe, record }) => {
      const isFavorite = state.favorites.includes(recipe.id);

      return `
        <article class="crafted-card">
          ${createCupcakeArt(recipe, "small")}
          <div class="crafted-card__copy">
            <strong>${recipe.name}</strong>
            <p>${recipe.description}</p>
            <div class="crafted-card__footer">
              ${createTag(`보유 ${record.count}개`)}
              ${createTag(recipe.collectionLabel)}
              <button class="mini-button" data-action="toggle-favorite-list" data-recipe="${recipe.id}">
                ${isFavorite ? "내리기" : "올리기"}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  elements.craftedList.querySelectorAll("[data-action='toggle-favorite-list']").forEach((button) => {
    button.addEventListener("click", () => toggleFavorite(button.dataset.recipe));
  });
}

function populateFilters() {
  elements.rarityFilter.innerHTML = `
    <option value="all">전체 희귀도</option>
    ${Object.entries(RARITY_META)
      .map(([rarityKey, meta]) => `<option value="${rarityKey}">${meta.label}</option>`)
      .join("")}
  `;

  elements.collectionFilter.innerHTML = `
    <option value="all">전체 테마</option>
    ${Object.entries(COLLECTION_META)
      .map(([collectionKey, meta]) => `<option value="${collectionKey}">${meta.label}</option>`)
      .join("")}
  `;
}

function renderMessages() {
  elements.deliveryMessage.textContent = uiState.deliveryMessage;
}

function render() {
  syncDeliveryBoxes();
  renderHeader();
  renderCountdown();
  renderDailyRecipe();
  renderIngredientBoard();
  renderSelectionPreview();
  renderCraftResult();
  renderDex();
  renderShowcase();
  renderMessages();
}

function bindEvents() {
  elements.claimBoxesButton.addEventListener("click", claimPendingBoxes);
  elements.dailyGiftButton.addEventListener("click", claimDailyGift);
  elements.craftButton.addEventListener("click", craftCupcake);
  elements.clearSelectionButton.addEventListener("click", clearSelection);
  elements.rarityFilter.addEventListener("change", renderDex);
  elements.collectionFilter.addEventListener("change", renderDex);
  elements.searchInput.addEventListener("input", renderDex);
  elements.resetButton.addEventListener("click", resetSave);
}

function boot() {
  populateFilters();
  bindEvents();
  saveState();
  render();
  window.setInterval(() => {
    syncDeliveryBoxes();
    renderHeader();
    renderCountdown();
    renderDailyRecipe();
  }, 1000);
}

boot();
