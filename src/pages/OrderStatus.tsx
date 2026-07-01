import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Copy, CornerUpLeft, CreditCard, DollarSign, ExternalLink, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_price: number;
  payment_method: string;
  payment_status: string;
  shipping_status: string;
  created_at: string;
}

const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mercado Pago response data (holds Pix QR code, redirect links, etc.)
  const [mpData, setMpData] = useState<any>(location.state?.mpData || null);

  // Fetch Order
  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();
      
      if (data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to Realtime Updates for this order
    const channel = supabase
      .channel(`order-update-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        (payload) => {
          setOrder(payload.new as Order);
          toast({ title: "Pedido atualizado!", description: `Status de pagamento: ${payload.new.payment_status}` });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Código Pix Copia e Cola copiado para a área de transferência." });
  };

  const handleWhatsAppRedirect = () => {
    if (!order) return;
    const address = order.delivery_address as any;
    const addressString = address ? `${address.rua}, ${address.numero}${address.complemento ? ' - ' + address.complemento : ''}, ${address.bairro}, ${address.cidade}/${address.estado}` : '';
    const msg = `*Finalizar Pedido ChrisCell*%0A%0A` +
      `*ID do Pedido:* ${order.id}%0A` +
      `*Cliente:* ${order.customer_name}%0A%0A` +
      `*Total:* ${formatPrice(order.total_price)}%0A` +
      `*Endereço:* ${addressString}`;

    window.open(`https://wa.me/5512981149421?text=${msg}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <p className="text-destructive font-bold text-lg mb-4">Pedido não encontrado</p>
        <Button onClick={() => navigate("/loja")}>Voltar para Loja</Button>
      </div>
    );
  }

  const isPix = order.payment_method === "pix";
  const isPending = order.payment_status === "pending";
  const isApproved = order.payment_status === "approved";

  // Extracts Pix metadata from State or payment data
  const qrCodeBase64 = mpData?.qr_code_base64 || "";
  const qrCodeText = mpData?.qr_code || "";
  const ticketUrl = mpData?.ticket_url || "";

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-12 bg-background flex items-center justify-center">
        <div className="container max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-border/50 bg-card p-6 md:p-8 shadow-xl text-center space-y-6"
          >
            {/* Header Status Icons */}
            <div className="flex justify-center">
              {isApproved ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 ring-2 ring-emerald-500/30">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              ) : isPending ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-2 ring-amber-500/30 animate-pulse">
                  <Clock className="h-12 w-12" />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-2 ring-destructive/30">
                  <Clock className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* Status Title */}
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {isApproved
                  ? "Pagamento Aprovado!"
                  : isPending
                  ? "Aguardando Pagamento..."
                  : `Pagamento: ${order.payment_status}`}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                ID do Pedido: <span className="font-mono text-xs">{order.id}</span>
              </p>
            </div>

            {/* Summary Details */}
            <div className="rounded-xl bg-background/50 border border-border/40 p-4 text-left space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium text-foreground">{order.customer_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Método de pagamento</span>
                <span className="font-medium text-foreground capitalize flex items-center gap-1.5">
                  {isPix ? <DollarSign className="h-4 w-4 text-emerald-500" /> : <CreditCard className="h-4 w-4 text-primary" />}
                  {order.payment_method === "pix" ? "PIX" : "Cartão de Crédito"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status da Entrega</span>
                <span className="font-medium text-foreground capitalize">{order.shipping_status}</span>
              </div>
              <div className="border-t border-border/30 my-2 pt-2 flex justify-between font-bold text-base">
                <span className="text-foreground">Valor Total</span>
                <span className="text-primary">{formatPrice(order.total_price)}</span>
              </div>
            </div>

            {/* Pix QR Code Display Section */}
            {isPix && isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 pt-2 border-t border-border/40"
              >
                {qrCodeBase64 ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-semibold text-foreground mb-3">Escaneie o QR Code abaixo para pagar</p>
                    <div className="bg-white p-3 rounded-2xl shadow-md border border-border/40">
                      <img src={`data:image/jpeg;base64,${qrCodeBase64}`} alt="QR Code Pix" className="h-48 w-48" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-sm font-semibold text-foreground">Conclua o pagamento via WhatsApp</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Seu pedido foi registrado! Clique no botão abaixo para enviar o resumo do seu pedido no WhatsApp da ChrisCell e receber a chave PIX para pagamento.
                    </p>
                    <Button onClick={handleWhatsAppRedirect} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold w-full">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.59 2.019 14.12 1.01 11.493 1.01c-5.437 0-9.863 4.37-9.867 9.801-.001 1.73.457 3.42 1.32 4.92l-1.017 3.714 3.829-1.001z" />
                      </svg>
                      Enviar Mensagem no WhatsApp
                    </Button>
                  </div>
                )}

                {qrCodeText && (
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground block">Ou utilize o Pix Copia e Cola:</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={qrCodeText}
                        className="flex-1 bg-background border border-border/60 rounded-xl px-3 py-2 text-xs font-mono select-all focus:outline-none"
                      />
                      <Button onClick={() => copyToClipboard(qrCodeText)} size="icon" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {ticketUrl && (
                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
                  >
                    Ver detalhes do Pix no Mercado Pago <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </motion.div>
            )}

            {/* Buttons Flow */}
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => navigate("/loja")} className="w-full gap-2 py-5 font-semibold">
                <CornerUpLeft className="h-4 w-4" /> Continuar Comprando
              </Button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Compra protegida por Mercado Pago SSL</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderStatus;
