"use client"

import React, { useEffect, useState } from "react";
import { NutritionBox } from "@/components/builder/nutrition-box";

type Category = {
  id: string;
  name: string;
  description: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load categories");
        setLoading(false);
      });
  }, []);

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <div className="flex flex-row gap-6">
        {/* Price box placeholder */}
        <div className="flex-1">
          <div className="rounded-lg border bg-muted p-4 w-full max-w-xs shadow-md">
            <h2 className="text-lg font-semibold mb-2">Price</h2>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Category Price</span>
                <span className="font-bold">$0.00</span>
              </div>
            </div>
          </div>
        </div>
        {/* Nutrition box */}
        <div className="flex-1">
          <NutritionBox calorieCount={0} proteinGrams={0} fatGrams={0} carbsGrams={0} />
        </div>
      </div>
      <div className="mt-8">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <li key={cat.id} className="rounded border bg-card p-4 shadow">
                <div className="font-semibold text-lg mb-1">{cat.name}</div>
                <div className="text-muted-foreground text-sm">{cat.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
