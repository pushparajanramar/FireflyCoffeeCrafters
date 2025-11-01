import { NutritionBox } from "@/components/builder/nutrition-box";
import { notFound } from "next/navigation";

async function getSize(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/options/sizes/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function SizeDetailPage({ params }: { params: { id: string } }) {
  const size = await getSize(params.id);
  if (!size) return notFound();
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{size.name}</h1>
      <div className="mb-4 text-muted-foreground">{size.volume_ml} ml</div>
      <NutritionBox calorieCount={size.calorie_count} proteinGrams={size.protein_grams} fatGrams={size.fat_grams} carbsGrams={size.carbs_grams} />
    </main>
  );
}
