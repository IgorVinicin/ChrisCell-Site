import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import productCase from "@/assets/product-case1.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  description?: string | null;
}

const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Loja = () => {
  const { addItem, setIsOpen, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when modal opens
  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
    }
  }, [selectedProduct]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleAdd = (p: Product) => {
    // Note: p.stock_quantity is checked on type cast if it exists. In current typescript types we will cast to any or just retrieve if it exists.
    const prod = p as any;
    if (prod.stock_quantity !== undefined && prod.stock_quantity <= 0) {
      toast({ title: "Sem estoque", description: "Este produto está indisponível no momento.", variant: "destructive" });
      return;
    }
    addItem({ id: p.id, name: p.name, price: p.price, img: p.image_url || productCase });
  };

  return (
    <>
      <Header />
      <WhatsAppFloat />
      <CartDrawer />
      <main className="min-h-screen pt-16">
        <section className="py-32 md:py-40">
          <div className="container">
            <motion.div initial="hidden" animate="visible" className="mb-20 text-center">
              <motion.span variants={fadeUp} custom={0} className="mb-4 block text-xs font-bold uppercase tracking-[0.4em] text-primary">
                Loja de Acessórios
              </motion.span>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Acessórios para seu <span className="text-gradient">smartphone</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mt-4 text-muted-foreground leading-relaxed font-light text-lg">
                Adicione ao carrinho e finalize pelo WhatsApp!
              </motion.p>
            </motion.div>

            {totalItems > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-24 right-6 z-30">
                <Button onClick={() => setIsOpen(true)} size="lg" className="gap-2 rounded-full shadow-lg">
                  <ShoppingCart className="h-5 w-5" /> Ver carrinho ({totalItems})
                </Button>
              </motion.div>
            )}

            {loading ? (
              <p className="text-center text-muted-foreground">Carregando produtos...</p>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum produto disponível no momento.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    variants={fadeUp}
                    className="group overflow-hidden rounded-[2rem] border border-border/20 bg-background/30 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:bg-background/60"
                  >
                    <div
                      onClick={() => setSelectedProduct(p)}
                      className="relative h-64 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={p.image_url || productCase}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-3 top-3 rounded-md bg-primary/90 px-2 py-1 text-xs font-semibold text-primary-foreground">
                        {p.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3
                        onClick={() => setSelectedProduct(p)}
                        className="mb-2 font-display text-lg font-bold tracking-tight text-foreground cursor-pointer hover:text-primary transition-colors line-clamp-1"
                      >
                        {p.name}
                      </h3>
                      <p className="mb-6 font-display text-2xl font-extrabold text-primary">{formatPrice(p.price)}</p>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/50 px-3 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
                        >
                          <Info className="h-4 w-4" /> Detalhes
                        </button>
                        <button
                          onClick={() => handleAdd(p)}
                          disabled={p.stock_quantity !== undefined && p.stock_quantity <= 0}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:glow-primary hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" /> {p.stock_quantity !== undefined && p.stock_quantity <= 0 ? "Esgotado" : "Carrinho"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 bg-background/80 backdrop-blur-2xl border-border/20 gap-0 sm:rounded-[2rem] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.6)]">
          {selectedProduct && (
            <div className="grid md:grid-cols-2">
              {/* Product Image Section */}
              <div className="relative h-64 md:h-full bg-background/50 min-h-[260px] md:min-h-[400px]">
                <img
                  src={selectedProduct.image_url || productCase}
                  alt={selectedProduct.name}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-lighten"
                />
                <span className="absolute left-4 top-4 rounded-md bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Product Info Section */}
              <div className="flex flex-col p-8 md:p-10 justify-between border-t md:border-t-0 md:border-l border-border/20">
                <div>
                  <DialogDescription className="sr-only">
                    Visualizar detalhes e escolher quantidade para {selectedProduct.name}
                  </DialogDescription>
                  <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-foreground mb-2">
                    {selectedProduct.name}
                  </DialogTitle>
                  <p className="font-display text-3xl font-extrabold text-primary mb-6">
                    {formatPrice(selectedProduct.price)}
                  </p>

                  <div className="border-t border-border/20 my-6 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                      Descrição do Produto
                    </h4>
                    <p className="text-sm font-light text-foreground/80 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                      {selectedProduct.description || "Nenhuma descrição detalhada disponível no momento para este produto."}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-border/20">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Quantidade</span>
                    <div className="flex items-center gap-4 border border-border/30 rounded-xl p-1 bg-background/30">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2rem] text-center font-display font-bold text-foreground text-base">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      addItem({
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        price: selectedProduct.price,
                        img: selectedProduct.image_url || productCase
                      }, quantity);
                      setSelectedProduct(null);
                    }}
                    disabled={(selectedProduct as any).stock_quantity !== undefined && (selectedProduct as any).stock_quantity <= 0}
                    className="w-full gap-3 text-sm font-bold tracking-wider uppercase py-6 rounded-xl transition-transform hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_hsl(var(--primary))]"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5" /> {selectedProduct.stock_quantity !== undefined && selectedProduct.stock_quantity <= 0 ? "Produto Esgotado" : "Adicionar ao carrinho"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Loja;
