import { NutritionBox } from "@/components/builder/nutrition-box";
import { notFound } from "next/navigation";

async function getTemperature(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/options/temperatures/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function TemperatureDetailPage({ params }: { params: { id: string } }) {
  const temperature = await getTemperature(params.id);
  if (!temperature) return notFound();
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{temperature.name}</h1>
      <NutritionBox calorieCount={temperature.calorie_count} proteinGrams={0} fatGrams={0} carbsGrams={0} />
    </main>
  );
}
