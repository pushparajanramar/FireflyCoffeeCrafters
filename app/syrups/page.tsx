
"use client"

import React, { useEffect, useState } from "react";
import { NutritionBox } from "@/components/builder/nutrition-box";

type Syrup = {
  id: string;
  name: string;
  is_seasonal: boolean;
  calorie_count: number;
  protein_grams: number;
  fat_grams: number;
  carbs_grams: number;
};

export default function SyrupsPage() {
  const [syrups, setSyrups] = useState<Syrup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/options/syrups")
      .then((res) => res.json())
      .then((data) => {
        setSyrups(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load syrups");
        setLoading(false);
      });
  }, []);

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Syrups</h1>
      <div className="flex flex-row gap-6">
        {/* Price box placeholder */}
        <div className="flex-1">
          <div className="rounded-lg border bg-muted p-4 w-full max-w-xs shadow-md">
            <h2 className="text-lg font-semibold mb-2">Price</h2>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Syrup Price</span>
                <span className="font-bold">$0.30</span>
              </div>
            </div>
          </div>
        </div>
        {/* Nutrition box */}
        <div className="flex-1">
          <NutritionBox calorieCount={20} proteinGrams={0} fatGrams={0} carbsGrams={5} />
        </div>
      </div>
      <div className="mt-8">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {syrups.map((syrup) => (
              <li key={syrup.id} className="rounded border bg-card p-4 shadow">
                <div className="font-semibold text-lg mb-1">{syrup.name}</div>
                <div className="text-muted-foreground text-sm mb-2">{syrup.is_seasonal ? "Seasonal" : "Regular"}</div>
                <NutritionBox calorieCount={syrup.calorie_count} proteinGrams={syrup.protein_grams} fatGrams={syrup.fat_grams} carbsGrams={syrup.carbs_grams} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
