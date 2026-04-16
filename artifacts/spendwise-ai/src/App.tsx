import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

// Pages
import Dashboard from "./pages/dashboard";
import Transactions from "./pages/transactions";
import Categories from "./pages/categories";
import Budgets from "./pages/budgets";
import Nudges from "./pages/nudges";
import Investments from "./pages/investments";
import ImpulseControls from "./pages/impulse-controls";
import Gamification from "./pages/gamification";
import Admin from "./pages/admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/categories" component={Categories} />
        <Route path="/budgets" component={Budgets} />
        <Route path="/nudges" component={Nudges} />
        <Route path="/investments" component={Investments} />
        <Route path="/impulse-controls" component={ImpulseControls} />
        <Route path="/gamification" component={Gamification} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
