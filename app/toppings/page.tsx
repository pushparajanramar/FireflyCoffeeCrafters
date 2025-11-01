
"use client"

import React, { useEffect, useState } from "react";
import { NutritionBox } from "@/components/builder/nutrition-box";

type Topping = {
  id: string;
  name: string;
  type: string;
  calorie_count: number;
  protein_grams: number;
  fat_grams: number;
  carbs_grams: number;
};

export default function ToppingsPage() {
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/options/toppings")
      .then((res) => res.json())
      .then((data) => {
        setToppings(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load toppings");
        setLoading(false);
      });
  }, []);

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Toppings</h1>
      <div className="flex flex-row gap-6">
        {/* Price box placeholder */}
        <div className="flex-1">
          <div className="rounded-lg border bg-muted p-4 w-full max-w-xs shadow-md">
            <h2 className="text-lg font-semibold mb-2">Price</h2>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Topping Price</span>
                <span className="font-bold">$0.40</span>
              </div>
            </div>
          </div>
        </div>
        {/* Nutrition box */}
        <div className="flex-1">
          <NutritionBox calorieCount={80} proteinGrams={0} fatGrams={8} carbsGrams={1} />
        </div>
      </div>
      <div className="mt-8">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toppings.map((topping) => (
              <li key={topping.id} className="rounded border bg-card p-4 shadow">
                <div className="font-semibold text-lg mb-1">{topping.name}</div>
                <div className="text-muted-foreground text-sm mb-2">{topping.type}</div>
                <NutritionBox calorieCount={topping.calorie_count} proteinGrams={topping.protein_grams} fatGrams={topping.fat_grams} carbsGrams={topping.carbs_grams} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
