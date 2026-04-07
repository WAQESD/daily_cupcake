import type { CSSProperties } from "react";
import type { Recipe } from "../types/game";

interface CupcakeArtProps {
  recipe: Recipe;
  size?: "medium" | "small";
}

export function CupcakeArt({ recipe, size = "medium" }: CupcakeArtProps) {
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

  const toppingIngredient =
    recipe.ingredients.find((ingredient) => ingredient.category === "topping") ??
    recipe.ingredients.at(-1) ??
    recipe.ingredients[0];
  const finishIngredient =
    recipe.ingredients.find((ingredient) => ingredient.category === "finisher") ??
    recipe.ingredients.at(0) ??
    recipe.ingredients.at(-1);

  return (
    <div className={`cupcake-art cupcake-art--${size}`} style={style}>
      <div className="cupcake-art__halo" />
      <div className="cupcake-art__shadow" />
      <div className="cupcake-art__sparkle" />
      <div className="cupcake-art__finish">{finishIngredient?.short ?? ""}</div>
      <div className="cupcake-art__cream">
        <span />
        <span />
        <span />
      </div>
      <div className="cupcake-art__drizzle" />
      <div className="cupcake-art__topping">{toppingIngredient?.short ?? ""}</div>
      <div className="cupcake-art__cake" />
      <div className="cupcake-art__plate" />
      <div className="cupcake-art__wrapper" />
    </div>
  );
}
