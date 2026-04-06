import hazelTeatimeArchivist from "../../assets/images/special-cupcakes/hazel-teatime-archivist.png";
import leafForestTeaPoet from "../../assets/images/special-cupcakes/leaf-forest-tea-poet.png";
import luluRibbonBallerina from "../../assets/images/special-cupcakes/lulu-ribbon-ballerina.png";
import maronCocoaTailor from "../../assets/images/special-cupcakes/maron-cocoa-tailor.png";
import momoBerryGardener from "../../assets/images/special-cupcakes/momo-berry-gardener.png";
import popoCloudMailCarrier from "../../assets/images/special-cupcakes/popo-cloud-mail-carrier.png";
import rosyGreenhouseCurator from "../../assets/images/special-cupcakes/rosy-greenhouse-curator.png";
import solSunshineLeader from "../../assets/images/special-cupcakes/sol-sunshine-leader.png";
import sparkWorkshopMaster from "../../assets/images/special-cupcakes/spark-workshop-master.png";
import type { Recipe } from "../types/game";

export interface SpecialCupcake {
  recipeId: string;
  name: string;
  description: string;
  image: string;
}

const SPECIAL_CUPCAKES: Record<string, SpecialCupcake> = {
  "strawberry-fairy__strawberry-butter__cherry-bloom__pink-ribbon": {
    recipeId: "strawberry-fairy__strawberry-butter__cherry-bloom__pink-ribbon",
    name: "베리 정원사 모모 컵케이크",
    description: "딸기 잼으로 작은 일기장을 꾸미며 정원의 오늘을 기록하는 베리 수호자예요.",
    image: momoBerryGardener,
  },
  "vanilla-cloud__milk-cloud__bunny-marshmallow__sparkle-sugar": {
    recipeId: "vanilla-cloud__milk-cloud__bunny-marshmallow__sparkle-sugar",
    name: "구름 우편배달부 포포 컵케이크",
    description: "마시멜로 편지 가방을 메고 구름방 사이를 오가며 달콤한 소식을 전해요.",
    image: popoCloudMailCarrier,
  },
  "choco-puff__caramel-ribbon__cookie-star__honey-drizzle": {
    recipeId: "choco-puff__caramel-ribbon__cookie-star__honey-drizzle",
    name: "코코아 재봉사 마롱 컵케이크",
    description: "리본과 단추를 직접 꿰매며 파티 의상을 완성하는 포근한 아틀리에 장인이에요.",
    image: maronCocoaTailor,
  },
  "matcha-forest__cream-cheese__blueberry-pearl__honey-drizzle": {
    recipeId: "matcha-forest__cream-cheese__blueberry-pearl__honey-drizzle",
    name: "숲속 차 시인 리프 컵케이크",
    description: "찻잎 책갈피를 모으며 숲의 향과 티타임의 기억을 조용히 적어 내려가요.",
    image: leafForestTeaPoet,
  },
  "lemon-sun__strawberry-butter__heart-sprinkle__honey-drizzle": {
    recipeId: "lemon-sun__strawberry-butter__heart-sprinkle__honey-drizzle",
    name: "햇살 축제단 솔 컵케이크",
    description: "아침 햇살을 모아 모두의 티타임을 환하게 밝혀 주는 축제 리더예요.",
    image: solSunshineLeader,
  },
  "vanilla-cloud__cream-cheese__cherry-bloom__flower-candy": {
    recipeId: "vanilla-cloud__cream-cheese__cherry-bloom__flower-candy",
    name: "꽃온실 큐레이터 로지 컵케이크",
    description: "계절마다 다른 꽃사탕 장식을 큐레이션하며 온실을 가장 아름답게 가꿔요.",
    image: rosyGreenhouseCurator,
  },
  "vanilla-cloud__cotton-candy__heart-sprinkle__pink-ribbon": {
    recipeId: "vanilla-cloud__cotton-candy__heart-sprinkle__pink-ribbon",
    name: "꿈결 리본 무희 루루 컵케이크",
    description: "리본 먼지를 흩뿌리며 무대 위를 빙그르르 도는 꿈결 발레리나예요.",
    image: luluRibbonBallerina,
  },
  "lemon-sun__milk-cloud__cookie-star__sparkle-sugar": {
    recipeId: "lemon-sun__milk-cloud__cookie-star__sparkle-sugar",
    name: "반짝 공방장 스파크 컵케이크",
    description: "별 쿠키 도안을 설계하고 반짝 설탕을 굽는 축제 공방의 명랑한 장인이에요.",
    image: sparkWorkshopMaster,
  },
  "vanilla-cloud__cotton-candy__blueberry-pearl__stardust": {
    recipeId: "vanilla-cloud__cotton-candy__blueberry-pearl__stardust",
    name: "티타임 기록관 헤이즐 컵케이크",
    description: "다과 기록장을 정리하며 오래된 레시피 이야기와 별빛 메모를 들려줘요.",
    image: hazelTeatimeArchivist,
  },
};

export function getSpecialCupcake(recipeId: string | null | undefined) {
  if (!recipeId) {
    return null;
  }

  return SPECIAL_CUPCAKES[recipeId] ?? null;
}

export function getRecipePresentation(recipe: Pick<Recipe, "id" | "name" | "description">) {
  const specialCupcake = getSpecialCupcake(recipe.id);

  return {
    name: specialCupcake?.name ?? recipe.name,
    description: specialCupcake?.description ?? recipe.description,
    specialCupcake,
  };
}
