import { NutritionBox } from "@/components/builder/nutrition-box";
import { notFound } from "next/navigation";

async function getBase(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/options/bases/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function BaseDetailPage({ params }: { params: { id: string } }) {
  const base = await getBase(params.id);
  if (!base) return notFound();
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{base.name}</h1>
      <div className="mb-4 text-muted-foreground">{base.description}</div>
      <NutritionBox calorieCount={base.calorie_count} proteinGrams={base.protein_grams} fatGrams={base.fat_grams} carbsGrams={base.carbs_grams} />
    </main>
  );
}
