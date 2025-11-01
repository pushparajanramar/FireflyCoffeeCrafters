import { NutritionBox } from "@/components/builder/nutrition-box";
import { notFound } from "next/navigation";

async function getTopping(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/options/toppings/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function ToppingDetailPage({ params }: { params: { id: string } }) {
  const topping = await getTopping(params.id);
  if (!topping) return notFound();
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{topping.name}</h1>
      <div className="mb-4 text-muted-foreground">{topping.type}</div>
      <NutritionBox calorieCount={topping.calorie_count} proteinGrams={topping.protein_grams} fatGrams={topping.fat_grams} carbsGrams={topping.carbs_grams} />
    </main>
  );
}
