import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  name: string;
  price: string;
  img: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (name: string) => void;
  updateQuantity: (name: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) return prev.map((i) => i.name === item.name ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (name: string) => setItems((prev) => prev.filter((i) => i.name !== name));

  const updateQuantity = (name: string, quantity: number) => {
    if (quantity <= 0) return removeItem(name);
    setItems((prev) => prev.map((i) => i.name === name ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};
