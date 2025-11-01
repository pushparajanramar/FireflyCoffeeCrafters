"use client"

import React, { useEffect, useState } from "react";
import { NutritionBox } from "@/components/builder/nutrition-box";

type Base = {
  id: string;
  name: string;
  description: string;
  calorie_count: number;
  protein_grams: number;
  fat_grams: number;
  carbs_grams: number;
};

export default function BasesPage() {
  const [bases, setBases] = useState<Base[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/options/bases")
      .then((res) => res.json())
      .then((data) => {
        setBases(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bases");
        setLoading(false);
      });
  }, []);

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Bases</h1>
      <div className="flex flex-row gap-6">
        {/* Price box placeholder */}
        <div className="flex-1">
          <div className="rounded-lg border bg-muted p-4 w-full max-w-xs shadow-md">
            <h2 className="text-lg font-semibold mb-2">Price</h2>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span className="font-bold">$2.50</span>
              </div>
            </div>
          </div>
        </div>
        {/* Nutrition box */}
        <div className="flex-1">
          <NutritionBox calorieCount={5} proteinGrams={1} fatGrams={0} carbsGrams={0} />
        </div>
      </div>
      <div className="mt-8">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bases.map((base) => (
              <li key={base.id} className="rounded border bg-card p-4 shadow">
                <div className="font-semibold text-lg mb-1">{base.name}</div>
                <div className="text-muted-foreground text-sm mb-2">{base.description}</div>
                <NutritionBox calorieCount={base.calorie_count} proteinGrams={base.protein_grams} fatGrams={base.fat_grams} carbsGrams={base.carbs_grams} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
