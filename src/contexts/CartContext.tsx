import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDbOffline: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("chriscell-cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erro ao carregar carrinho do localStorage", e);
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isDbOffline, setIsDbOffline] = useState(false);

  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        // Query the products table to see if the database is online
        const { error } = await supabase.from("products").select("id").limit(1);
        if (error) {
          console.warn("DB Health Check warning:", error.message);
          // If paused (503/504) or network request fails due to offline database
          if (error.status === 503 || error.status === 504 || error.message.toLowerCase().includes("fetch")) {
            setIsDbOffline(true);
          }
        }
      } catch (err) {
        console.error("DB Health Check error:", err);
        setIsDbOffline(true);
      }
    };
    checkDbStatus();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("chriscell-cart", JSON.stringify(items));
    } catch (e) {
      console.error("Erro ao salvar carrinho no localStorage", e);
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        toast({ title: "Item adicionado!", description: `${item.name} adicionado ao carrinho.` });
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      toast({ title: "Item adicionado!", description: `${item.name} adicionado ao carrinho.` });
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, isOpen, setIsOpen, isDbOffline }}>
      {children}
    </CartContext.Provider>
  );
};
