import type { CSSProperties } from "react";
import { getSpecialCupcake } from "../data/specialCupcakes";
import type { Recipe } from "../types/game";

interface CupcakeArtProps {
  recipe: Recipe;
  size?: "medium" | "small";
}

export function CupcakeArt({ recipe, size = "medium" }: CupcakeArtProps) {
  const specialCupcake = getSpecialCupcake(recipe.id);
  const style = {
    "--wrapper-color": recipe.palette.wrapper,
    "--cake-color": recipe.palette.cake,
    "--cream-color": recipe.palette.cream,
    "--cream-accent": recipe.palette.frostingAccent,
    "--topping-color": recipe.palette.topping,
    "--topper-accent": recipe.palette.topperAccent,
    "--finish-color": recipe.palette.finish,
    "--finish-accent": recipe.palette.finishAccent,
    "--rarity-color": recipe.palette.rarity,
    "--collection-color": recipe.palette.collection,
  } as CSSProperties;

  const toppingLabel = recipe.ingredients[2]?.short ?? "";
  const finishLabel = recipe.ingredients[3]?.short ?? "";

  if (specialCupcake) {
    return (
      <div className={`cupcake-art cupcake-art--${size} cupcake-art--special`} style={style}>
        <div className="cupcake-art__special-glow" />
        <img className="cupcake-art__portrait" src={specialCupcake.image} alt={specialCupcake.name} loading="lazy" />
      </div>
    );
  }

  return (
    <div className={`cupcake-art cupcake-art--${size}`} style={style}>
      <div className="cupcake-art__sparkle" />
      <div className="cupcake-art__finish">{finishLabel}</div>
      <div className="cupcake-art__cream">
        <span />
        <span />
        <span />
      </div>
      <div className="cupcake-art__topping">{toppingLabel}</div>
      <div className="cupcake-art__cake" />
      <div className="cupcake-art__wrapper" />
    </div>
  );
}
