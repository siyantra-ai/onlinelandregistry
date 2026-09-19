import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import PublicLayout from "@/components/layout/PublicLayout";
import Home from "@/pages/home";
import OrderWizard from "@/pages/order";
import OrderSuccess from "@/pages/order-success";
import FAQPage from "@/pages/faq";
import ContactPage from "@/pages/contact";
import Blogs from "@/pages/Blogs";
import BlogPost from "@/pages/BlogPost";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import CookiesPage from "@/pages/cookies";
import RefundPage from "@/pages/refund-policy";

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
      <Route path="/faqs">
        <PublicLayout>
          <FAQPage />
        </PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout>
          <ContactPage />
        </PublicLayout>
      </Route>
      <Route path="/blog">
        <PublicLayout>
          <Blogs />
        </PublicLayout>
      </Route>
      <Route path="/blog/post/:slug">
        {(params) => (
          <PublicLayout>
            <BlogPost slug={params.slug} />
          </PublicLayout>
        )}
      </Route>
      <Route path="/privacy">
        <PublicLayout>
          <PrivacyPage />
        </PublicLayout>
      </Route>
      <Route path="/terms">
        <PublicLayout>
          <TermsPage />
        </PublicLayout>
      </Route>
      <Route path="/cookies">
        <PublicLayout>
          <CookiesPage />
        </PublicLayout>
      </Route>
      <Route path="/refund-policy">
        <PublicLayout>
          <RefundPage />
        </PublicLayout>
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
