import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, Home, ClipboardList, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import logo from "@/assets/logo-chriscell.png";

const navItems = [
  { label: "Início", path: "/", icon: Home },
  { label: "Orçamento", path: "/orcamento", icon: ClipboardList },
  { label: "Loja", path: "/loja", icon: ShoppingBag },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setIsOpen: openCart } = useCart();

  return (
    <header className="fixed inset-x-4 top-4 z-40 rounded-3xl border border-border/50 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/90 md:inset-x-0 md:top-0 md:rounded-b-[2.5rem]">
      {/* subtle gradient accent line */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-primary/30 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
            <img
              src={logo}
              alt="Chriscell"
              className="relative h-10 w-10 rounded-lg object-cover ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            CHRIS<span className="text-gradient">CELL</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                <span>{item.label}</span>
                {active && (
                  <span className="absolute inset-x-2 -bottom-0.5 h-px rounded-full bg-gradient-to-r from-primary to-primary/40" />
                )}
              </Link>
            );
          })}
          <Link
            to="/orcamento"
            className="ml-3 rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/10 transition-all hover:shadow-primary/40 hover:brightness-110"
          >
            Fazer orçamento
          </Link>
          <button onClick={() => openCart(true)} className="relative text-muted-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/loja"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
          >
            <ShoppingBag className="h-4 w-4" />
            Loja
          </Link>
          <button onClick={() => openCart(true)} className="relative text-foreground">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={() => setOpen(!open)} className="text-foreground" aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="container flex flex-col gap-3 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-white/5 hover:text-primary"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                to="/orcamento"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
              >
                Fazer orçamento
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
