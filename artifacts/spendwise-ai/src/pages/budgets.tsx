import { useListBudgets, getListBudgetsQueryKey } from "@workspace/api-client-react";

export default function Budgets() {
  const { data: budgets, isLoading } = useListBudgets({
    query: { queryKey: getListBudgetsQueryKey() }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
      <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        {isLoading ? <p>Loading...</p> : (
          <pre>{JSON.stringify(budgets, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}