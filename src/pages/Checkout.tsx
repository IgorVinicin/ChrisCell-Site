import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, DollarSign, Loader2, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { maskCPF, maskPhone, maskCEP } from "@/lib/utils";

const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Checkout = () => {
  const { items, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [freightCost, setFreightCost] = useState<number | null>(null);
  
  // Checkout Form State
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    // Card details
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    installments: "1"
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (freightCost || 0);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/loja");
    }
  }, [items, navigate]);

  const calculateFreight = (cidade: string, bairro: string) => {
    const city = cidade.toLowerCase().trim();
    if (city !== "são josé dos campos" && city !== "sao jose dos campos") {
      toast({ 
        title: "Entrega Indisponível", 
        description: "Atualmente realizamos entregas apenas em São José dos Campos.", 
        variant: "destructive" 
      });
      setFreightCost(null);
      return;
    }

    const b = bairro.toLowerCase();
    let cost = 15.00; // Valor base padrão

    // Mapeamento básico de Zonas em SJC (pode ser ajustado)
    if (b.includes("sul") || b.includes("bosque") || b.includes("morumbi") || b.includes("satélite") || b.includes("satelite")) {
      cost = 10.00; // Zona Sul
    } else if (b.includes("centro") || b.includes("vila ema") || b.includes("vila adyana") || b.includes("esplanada")) {
      cost = 8.00; // Região Central
    } else if (b.includes("norte") || b.includes("santana") || b.includes("alto")) {
      cost = 12.00; // Zona Norte
    } else if (b.includes("leste") || b.includes("vista") || b.includes("tesouro") || b.includes("galo")) {
      cost = 15.00; // Zona Leste
    } else if (b.includes("putim") || b.includes("urbanova")) {
      cost = 20.00; // Regiões mais distantes
    }

    setFreightCost(cost);
    toast({ title: "Frete Calculado!", description: `Valor da entrega para o seu bairro: ${formatPrice(cost)}` });
  };

  // Cep auto fill
  const handleCepBlur = async () => {
    const cleanCep = form.cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm((f) => ({
            ...f,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || ""
          }));
          calculateFreight(data.localidade || "", data.bairro || "");
        }
      } catch (e) {
        console.error("Erro ao buscar CEP", e);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    const name = e.target.name;
    
    if (name === "cpf") value = maskCPF(value);
    if (name === "telefone") value = maskPhone(value);
    if (name === "cep") value = maskCEP(value);
    
    setForm({ ...form, [name]: value });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.telefone || !form.cpf || !form.cep || !form.rua || !form.numero || !form.bairro || !form.cidade || !form.estado) {
      toast({ title: "Preencha todos os campos obrigatórios!", variant: "destructive" });
      return;
    }

    if (freightCost === null) {
      toast({ title: "Entrega Indisponível", description: "Infelizmente não entregamos nesse endereço no momento.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // 1. Get current auth user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Insert order in public.orders
      const orderPayload = {
        user_id: user?.id || null,
        customer_name: form.nome,
        customer_email: form.email,
        customer_phone: form.telefone,
        delivery_address: {
          cep: form.cep,
          rua: form.rua,
          numero: form.numero,
          complemento: form.complemento,
          bairro: form.bairro,
          cidade: form.cidade,
          estado: form.estado
        },
        total_price: total,
        payment_method: paymentMethod,
        payment_status: "pending",
        shipping_status: "pending"
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      if (orderError || !order) {
        throw new Error(orderError?.message || "Erro ao criar pedido");
      }

      // 3. Insert order items in public.order_items
      const orderItemsPayload = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsError) {
        // Trigger table handles fallback, but let's throw
        throw new Error(itemsError.message);
      }

      // 4. Format and Redirect to WhatsApp for Payment / Finalization
      const itemsList = items.map(item => `• ${item.quantity}x ${item.name} (${formatPrice(item.price)})`).join('%0A');
      const addressString = `${form.rua}, ${form.numero}${form.complemento ? ' - ' + form.complemento : ''}, ${form.bairro}, ${form.cidade}/${form.estado}`;
      
      const msg = `*Novo Pedido ChrisCell*%0A%0A` +
        `*ID do Pedido:* ${order.id}%0A` +
        `*Cliente:* ${form.nome}%0A` +
        `*Telefone:* ${form.telefone}%0A%0A` +
        `*Itens:*%0A${itemsList}%0A%0A` +
        `*Subtotal:* ${formatPrice(subtotal)}%0A` +
        `*Frete:* ${formatPrice(freightCost)}%0A` +
        `*Total a Pagar:* ${formatPrice(total)}%0A` +
        `*Método:* PIX%0A%0A` +
        `*Endereço de Entrega:*%0A${addressString}`;

      const WHATSAPP_NUMBER = "5512981149421";
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");

      // Clear local cart
      clearCart();
      
      // Redirect to Order Success / Payment Status Page
      navigate(`/order-status/${order.id}`);

    } catch (err: any) {
      toast({
        title: "Erro ao processar pedido",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 pl-11 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur-sm transition-all focus:border-primary/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-24 md:pt-40 md:pb-32 bg-background/50">
        <div className="container max-w-6xl">
          <Button variant="ghost" onClick={() => navigate("/loja")} className="mb-8 gap-2 hover:bg-background/80 rounded-full px-6 transition-all duration-300">
            <ArrowLeft className="h-4 w-4" /> Voltar para Loja
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {/* Left Column: Form details */}
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCheckoutSubmit}
              className="space-y-6"
            >
              {/* Step 1: Identification */}
              <div className="rounded-[2rem] border border-border/20 bg-background/30 p-8 md:p-10 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 hover:bg-background/50 hover:-translate-y-1">
                <h2 className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight text-foreground mb-6">
                  <User className="h-6 w-6 text-primary" /> 1. Seus Dados
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      name="nome"
                      required
                      value={form.nome}
                      onChange={handleInputChange}
                      className={fieldClass}
                      placeholder="Nome Completo"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      name="telefone"
                      required
                      maxLength={15}
                      value={form.telefone}
                      onChange={handleInputChange}
                      className={fieldClass}
                      placeholder="WhatsApp (Ex: 12981149421)"
                    />
                  </div>
                  <div className="relative">
                    <Input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleInputChange}
                      className="rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 text-sm"
                      placeholder="E-mail"
                    />
                  </div>
                  <div className="relative">
                    <Input
                      name="cpf"
                      required
                      maxLength={14}
                      value={form.cpf}
                      onChange={handleInputChange}
                      className="rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 text-sm backdrop-blur-sm focus:bg-background/80"
                      placeholder="CPF (Apenas números)"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping/Delivery Address */}
              <div className="rounded-[2rem] border border-border/20 bg-background/30 p-8 md:p-10 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 hover:bg-background/50 hover:-translate-y-1">
                <h2 className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight text-foreground mb-6">
                  <MapPin className="h-6 w-6 text-primary" /> 2. Endereço de Entrega
                </h2>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      name="cep"
                      required
                      maxLength={9}
                      value={form.cep}
                      onChange={handleInputChange}
                      onBlur={handleCepBlur}
                      className="rounded-xl mt-1.5"
                      placeholder="12240-000"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="rua">Rua</Label>
                    <Input
                      id="rua"
                      name="rua"
                      required
                      value={form.rua}
                      onChange={handleInputChange}
                      className="rounded-xl mt-1.5"
                      placeholder="Avenida Paulista"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      name="numero"
                      required
                      value={form.numero}
                      onChange={handleInputChange}
                      className="rounded-xl mt-1.5"
                      placeholder="123"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      name="complemento"
                      value={form.complemento}
                      onChange={handleInputChange}
                      className="rounded-xl mt-1.5"
                      placeholder="Apto 45, Bloco B"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      name="bairro"
                      required
                      value={form.bairro}
                      onChange={handleInputChange}
                      className="rounded-xl mt-1.5"
                      placeholder="Centro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      required
                      value={form.cidade}
                      onChange={handleInputChange}
                      className="rounded-xl mt-1.5"
                      placeholder="São José dos Campos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      name="estado"
                      required
                      value={form.estado}
                      onChange={handleInputChange}
                      className="rounded-xl mt-1.5"
                      placeholder="SP"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="rounded-[2rem] border border-border/20 bg-background/30 p-8 md:p-10 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 hover:bg-background/50 hover:-translate-y-1">
                <h2 className="flex items-center gap-3 font-display text-2xl font-extrabold tracking-tight text-foreground mb-6">
                  <CreditCard className="h-6 w-6 text-primary" /> 3. Forma de Pagamento
                </h2>

                <div className="grid grid-cols-1 gap-5 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-primary/40 bg-primary/10 text-primary font-bold w-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lg"
                  >
                    <DollarSign className="h-8 w-8 mb-2" />
                    <span className="text-lg">PIX Automático</span>
                    <span className="text-xs opacity-80 mt-1 font-light tracking-wider uppercase">Confirmação na hora</span>
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Right Column: Order Summary */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-border/20 bg-background/30 p-8 md:p-10 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 hover:bg-background/50 hover:-translate-y-1 sticky top-32">
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground mb-6">Resumo do Pedido</h2>
                <div className="max-h-96 overflow-y-auto space-y-4 mb-8 pr-2 scrollbar-thin">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img src={item.img} alt={item.name} className="h-12 w-12 rounded object-cover border border-border/30" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity}x {formatPrice(item.price)}</p>
                      </div>
                      <p className="text-xs font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/40 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal ({totalItems} itens)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Frete</span>
                    {freightCost === null ? (
                      <span className="text-destructive font-medium text-xs text-right max-w-[150px]">Digite um CEP de SJC</span>
                    ) : (
                      <span className="font-medium">{formatPrice(freightCost)}</span>
                    )}
                  </div>
                  <div className="border-t border-border/20 pt-4 flex justify-between text-2xl font-extrabold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckoutSubmit}
                  disabled={loading}
                  className="w-full mt-8 py-7 text-sm font-bold tracking-wider uppercase rounded-xl transition-transform hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_hsl(var(--primary))]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" /> Finalizar Pagamento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
