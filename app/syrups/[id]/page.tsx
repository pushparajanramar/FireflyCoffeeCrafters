import { NutritionBox } from "@/components/builder/nutrition-box";
import { notFound } from "next/navigation";

async function getSyrup(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/options/syrups/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function SyrupDetailPage({ params }: { params: { id: string } }) {
  const syrup = await getSyrup(params.id);
  if (!syrup) return notFound();
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{syrup.name}</h1>
      <div className="mb-4 text-muted-foreground">{syrup.is_seasonal ? "Seasonal" : "Regular"}</div>
      <NutritionBox calorieCount={syrup.calorie_count} proteinGrams={syrup.protein_grams} fatGrams={syrup.fat_grams} carbsGrams={syrup.carbs_grams} />
    </main>
  );
}
