import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import Home from "@/pages/home";
import OrderWizard from "@/pages/order";
import OrderSuccess from "@/pages/order-success";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminOrders from "@/pages/admin-orders";
import AdminOrderDetail from "@/pages/admin-order-detail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <PublicLayout>
          <Home />
        </PublicLayout>
      </Route>
      <Route path="/order">
        <PublicLayout>
          <OrderWizard />
        </PublicLayout>
      </Route>
      <Route path="/order/success">
        <PublicLayout>
          <OrderSuccess />
        </PublicLayout>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/orders">
        <AdminLayout>
          <AdminOrders />
        </AdminLayout>
      </Route>
      <Route path="/admin/orders/:id">
        <AdminLayout>
          <AdminOrderDetail />
        </AdminLayout>
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
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
