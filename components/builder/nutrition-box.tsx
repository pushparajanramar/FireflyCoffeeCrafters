import React from "react";

interface NutritionBoxProps {
  calorieCount: number;
  proteinGrams?: number;
  fatGrams?: number;
  carbsGrams?: number;
}

export function NutritionBox({ calorieCount, proteinGrams, fatGrams, carbsGrams }: NutritionBoxProps) {
  const sumMacros =
    (proteinGrams ?? 0) +
    (fatGrams ?? 0) +
    (carbsGrams ?? 0);
  return (
  <div className="rounded-lg border bg-sb-light-green p-4 w-full max-w-xs shadow-md">
      <h2 className="text-lg font-semibold mb-2">Nutrition Facts</h2>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Calories</span>
          <span className="font-bold">{calorieCount}</span>
        </div>
        {proteinGrams !== undefined && (
          <div className="flex justify-between">
            <span>Protein</span>
            <span>{proteinGrams}g</span>
          </div>
        )}
        {fatGrams !== undefined && (
          <div className="flex justify-between">
            <span>Fat</span>
            <span>{fatGrams}g</span>
          </div>
        )}
        {carbsGrams !== undefined && (
          <div className="flex justify-between">
            <span>Carbs</span>
            <span>{carbsGrams}g</span>
          </div>
        )}
        <div className="flex justify-between mt-1 border-t pt-1">
          <span className="font-semibold">Total Macros</span>
          <span className="font-bold">{sumMacros}g</span>
        </div>
      </div>
    </div>
  );
}
