import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Minus, Trash2, Search, ShoppingCart, CreditCard, Banknote, QrCode, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
}

interface CartItem extends Product {
  cart_quantity: number;
}

export default function PosTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchActiveProducts();
  }, []);

  const fetchActiveProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, image_url")
      .eq("active", true)
      .gt("stock_quantity", 0);
      
    if (error) {
      toast({ title: "Erro ao buscar produtos", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        if (existing.cart_quantity >= product.stock_quantity) {
          toast({ title: "Estoque insuficiente", variant: "destructive" });
          return current;
        }
        return current.map(item => 
          item.id === product.id 
            ? { ...item, cart_quantity: item.cart_quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, cart_quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(current => {
      return current.map(item => {
        if (item.id === id) {
          const newQty = item.cart_quantity + delta;
          if (newQty > item.stock_quantity) {
            toast({ title: "Estoque insuficiente", variant: "destructive" });
            return item;
          }
          if (newQty < 1) return item;
          return { ...item, cart_quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id: string) => {
    setCart(current => current.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.cart_quantity), 0);

  const handleCheckout = async (paymentMethod: string) => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      // 1. Create Sale
      const { data: saleData, error: saleError } = await supabase
        .from("pos_sales")
        .insert({
          total_amount: total,
          payment_method: paymentMethod,
          customer_name: customerName || null
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Create Sale Items
      const saleItems = cart.map(item => ({
        sale_id: saleData.id,
        product_id: item.id,
        quantity: item.cart_quantity,
        price_at_sale: item.price
      }));

      const { error: itemsError } = await supabase.from("pos_sale_items").insert(saleItems);
      if (itemsError) throw itemsError;

      // 3. Decrease stock using the SQL function we created
      for (const item of cart) {
        const { error: rpcError } = await supabase.rpc('decrease_stock', {
          p_id: item.id,
          qty: item.cart_quantity
        });
        if (rpcError) throw rpcError;
      }

      toast({ title: "Venda finalizada com sucesso!" });
      setCart([]);
      setCustomerName("");
      fetchActiveProducts(); // refresh stock

    } catch (err: any) {
      toast({ title: "Erro na venda", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Esquerda: Lista de Produtos */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            ref={searchInputRef}
            placeholder="Buscar produto por nome ou código de barras..." 
            className="pl-10 h-12 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto border border-border/50 rounded-xl bg-background p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="cursor-pointer group relative overflow-hidden rounded-xl border border-border/40 bg-card hover:border-primary/50 hover:shadow-md transition-all p-3 flex flex-col items-center text-center h-40"
              >
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-16 w-16 object-contain mb-2 group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="h-16 w-16 bg-primary/10 rounded-lg mb-2 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-primary/40" />
                  </div>
                )}
                <p className="font-semibold text-xs leading-tight line-clamp-2 mb-1">{p.name}</p>
                <div className="mt-auto w-full flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">{p.stock_quantity} un</span>
                  <span className="font-bold text-primary text-sm">{formatPrice(p.price)}</span>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-10">
                <p>Nenhum produto em estoque encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direita: Carrinho e Checkout */}
      <div className="flex flex-col border border-border/50 rounded-xl bg-card overflow-hidden">
        <div className="bg-primary/5 p-4 border-b border-border/50 flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Carrinho (PDV)</h2>
          {cart.length > 0 && <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">{cart.length}</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <ShoppingCart className="h-16 w-16 mb-4" />
              <p>O carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex flex-col gap-2 border-b border-border/30 pb-3">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm leading-tight pr-4">{item.name}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 bg-background border border-border rounded-md">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:text-primary"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-bold w-6 text-center">{item.cart_quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:text-primary"><Plus className="h-3 w-3" /></button>
                    </div>
                    <span className="font-bold text-foreground">{formatPrice(item.price * item.cart_quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background p-4 border-t border-border/50 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Cliente (Opcional)</Label>
            <Input 
              placeholder="Nome do cliente..." 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-8 text-sm mt-1"
            />
          </div>
          
          <div className="flex justify-between items-center py-2 border-y border-border/30">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-3 gap-1 hover:border-green-500 hover:text-green-500"
              disabled={cart.length === 0 || loading}
              onClick={() => handleCheckout('dinheiro')}
            >
              <Banknote className="h-5 w-5" />
              <span className="text-[10px] uppercase">Dinheiro</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-3 gap-1 hover:border-[#00B4D8] hover:text-[#00B4D8]"
              disabled={cart.length === 0 || loading}
              onClick={() => handleCheckout('pix')}
            >
              <QrCode className="h-5 w-5" />
              <span className="text-[10px] uppercase">PIX</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-3 gap-1 hover:border-orange-500 hover:text-orange-500"
              disabled={cart.length === 0 || loading}
              onClick={() => handleCheckout('cartao')}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-[10px] uppercase">Cartão</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
