import { NutritionBox } from "@/components/builder/nutrition-box";
import { notFound } from "next/navigation";

async function getMilk(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/options/milks/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function MilkDetailPage({ params }: { params: { id: string } }) {
  const milk = await getMilk(params.id);
  if (!milk) return notFound();
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{milk.name}</h1>
      <div className="mb-4 text-muted-foreground">{milk.is_dairy_free ? "Dairy-Free" : "Dairy"}</div>
      <NutritionBox calorieCount={milk.calorie_count} proteinGrams={milk.protein_grams} fatGrams={milk.fat_grams} carbsGrams={milk.carbs_grams} />
    </main>
  );
}
