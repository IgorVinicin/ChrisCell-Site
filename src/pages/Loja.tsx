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
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleAdd = (p: Product) => {
    addItem({ name: p.name, price: formatPrice(p.price), img: p.image_url || productCase });
    toast({ title: "Adicionado ao carrinho!", description: p.name });
  };

  return (
    <>
      <Header />
      <WhatsAppFloat />
      <CartDrawer />
      <main className="min-h-screen pt-16">
        <section className="py-20">
          <div className="container">
            <motion.div initial="hidden" animate="visible" className="mb-12 text-center">
              <motion.span variants={fadeUp} custom={0} className="mb-2 block text-sm font-semibold text-primary">
                Loja de Acessórios
              </motion.span>
              <motion.h1 variants={fadeUp} custom={1} className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Acessórios para seu <span className="text-gradient">smartphone</span>
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="mt-2 text-muted-foreground">
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
                    className="group overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/30"
                  >
                    <div
                      onClick={() => setSelectedProduct(p)}
                      className="relative h-56 overflow-hidden cursor-pointer"
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
                    <div className="p-5">
                      <h3
                        onClick={() => setSelectedProduct(p)}
                        className="mb-1 font-display text-base font-semibold text-foreground cursor-pointer hover:text-primary transition-colors line-clamp-1"
                      >
                        {p.name}
                      </h3>
                      <p className="mb-4 font-display text-xl font-bold text-primary">{formatPrice(p.price)}</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted/50 transition-all"
                        >
                          <Info className="h-4 w-4" /> Detalhes
                        </button>
                        <button
                          onClick={() => handleAdd(p)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-all hover:glow-primary"
                        >
                          <Plus className="h-4 w-4" /> Carrinho
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
        <DialogContent className="max-w-2xl overflow-hidden p-0 bg-card border-border/50 gap-0 sm:rounded-xl">
          {selectedProduct && (
            <div className="grid md:grid-cols-2">
              {/* Product Image Section */}
              <div className="relative h-56 md:h-full bg-muted min-h-[260px] md:min-h-[350px]">
                <img
                  src={selectedProduct.image_url || productCase}
                  alt={selectedProduct.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-md bg-primary/90 px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  {selectedProduct.category}
                </span>
              </div>

              {/* Product Info Section */}
              <div className="flex flex-col p-6 justify-between border-t md:border-t-0 md:border-l border-border/40">
                <div>
                  <DialogDescription className="sr-only">
                    Visualizar detalhes e escolher quantidade para {selectedProduct.name}
                  </DialogDescription>
                  <DialogTitle className="font-display text-xl font-bold text-foreground mb-1">
                    {selectedProduct.name}
                  </DialogTitle>
                  <p className="font-display text-2xl font-bold text-primary mb-4">
                    {formatPrice(selectedProduct.price)}
                  </p>

                  <div className="border-t border-border/50 my-4 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Descrição do Produto
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                      {selectedProduct.description || "Nenhuma descrição detalhada disponível no momento para este produto."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Quantidade</span>
                    <div className="flex items-center gap-3 border border-border rounded-lg p-1 bg-background/50">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2rem] text-center font-display font-semibold text-foreground text-sm">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <Button
                    onClick={() => {
                      addItem({
                        name: selectedProduct.name,
                        price: formatPrice(selectedProduct.price),
                        img: selectedProduct.image_url || productCase
                      }, quantity);
                      toast({
                        title: "Adicionado ao carrinho!",
                        description: `${quantity}x ${selectedProduct.name}`,
                      });
                      setSelectedProduct(null);
                    }}
                    className="w-full gap-2 text-sm font-semibold py-5"
                    size="lg"
                  >
                    <ShoppingCart className="h-4 w-4" /> Adicionar ao carrinho
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
