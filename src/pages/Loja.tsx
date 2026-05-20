import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
}

const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Loja = () => {
  const { addItem, setIsOpen, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
                    <div className="relative h-56 overflow-hidden">
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
                      <h3 className="mb-1 font-display text-base font-semibold text-foreground">{p.name}</h3>
                      <p className="mb-4 font-display text-xl font-bold text-primary">{formatPrice(p.price)}</p>
                      <button
                        onClick={() => handleAdd(p)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:glow-primary"
                      >
                        <Plus className="h-4 w-4" /> Adicionar ao carrinho
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Loja;
