import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index.tsx";
import Orcamento from "./pages/Orcamento.tsx";
import Loja from "./pages/Loja.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderStatus from "./pages/OrderStatus.tsx";
import OsStatus from "./pages/OsStatus.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/orcamento" element={<Orcamento />} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-status/:id" element={<OrderStatus />} />
            <Route path="/os" element={<OsStatus />} />
            <Route path="/os/:id" element={<OsStatus />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
