import { notFound } from "next/navigation";

async function getSubcategory(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/subcategories/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function SubcategoryDetailPage({ params }: { params: { id: string } }) {
  const subcategory = await getSubcategory(params.id);
  if (!subcategory) return notFound();
  // Link to builder with subcategory name as query param
  const builderUrl = `/builder?subcategory=${encodeURIComponent(subcategory.name)}`;
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{subcategory.name}</h1>
      <div className="mb-4 text-muted-foreground">{subcategory.description}</div>
      <a
        href={builderUrl}
        className="inline-block mt-6 px-6 py-3 bg-brand-primary text-white rounded-lg shadow hover:bg-brand-primary-hover transition"
      >
        Start with this subcategory
      </a>
    </main>
  );
}
