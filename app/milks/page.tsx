import React from "react";
import { NutritionBox } from "@/components/builder/nutrition-box";

export default function MilksPage() {
  // TODO: Fetch milks from API and render
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Milks</h1>
      <div className="flex flex-row gap-6">
        {/* Price box placeholder */}
        <div className="flex-1">
          <div className="rounded-lg border bg-muted p-4 w-full max-w-xs shadow-md">
            <h2 className="text-lg font-semibold mb-2">Price</h2>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Milk Price</span>
                <span className="font-bold">$0.50</span>
              </div>
            </div>
          </div>
        </div>
        {/* Nutrition box */}
        <div className="flex-1">
          <NutritionBox calorieCount={70} proteinGrams={3} fatGrams={4} carbsGrams={5} />
        </div>
      </div>
      <div className="mt-8">
        {/* Render milks list here */}
        <p>Milks page coming soon.</p>
      </div>
    </main>
  );
}
