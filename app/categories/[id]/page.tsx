import { NutritionBox } from "@/components/builder/nutrition-box";
import { notFound } from "next/navigation";

async function getCategory(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/categories/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function CategoryDetailPage({ params }: { params: { id: string } }) {
  const category = await getCategory(params.id);
  if (!category) return notFound();
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{category.name}</h1>
      <div className="mb-4 text-muted-foreground">{category.description}</div>
      <NutritionBox calorieCount={category.calorie_count || 0} proteinGrams={category.protein_grams || 0} fatGrams={category.fat_grams || 0} carbsGrams={category.carbs_grams || 0} />
    </main>
  );
}
