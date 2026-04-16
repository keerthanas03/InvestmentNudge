import { useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        {isLoading ? <p>Loading...</p> : (
          <pre>{JSON.stringify(categories, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}