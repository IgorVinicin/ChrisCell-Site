import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  CreditCard, Banknote, QrCode, MonitorSmartphone, Store, Globe, RefreshCcw, Minus, Plus
} from "lucide-react";

export default function ReportsTab() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"hoje" | "semana" | "mes">("hoje");
  
  // Dashboard Metrics
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    salesCount: 0,
    byMethod: { dinheiro: 0, pix: 0, cartao: 0 },
    byOrigin: { pdv: 0, site: 0, os: 0 },
    cashDrawer: 0 // Dinheiro real na gaveta
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [txType, setTxType] = useState<"suprimento" | "sangria">("suprimento");
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [savingTx, setSavingTx] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Calcula as datas de filtro
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Hoje (meia-noite)

    if (period === "semana") {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
      startDate.setDate(diff);
    } else if (period === "mes") {
      startDate.setDate(1); // Primeiro dia do mês
    }

    const startISO = startDate.toISOString();

    try {
      // 1. Fetch PDV Sales
      const { data: posData, error: posErr } = await supabase
        .from("pos_sales")
        .select("*, pos_sale_items(quantity, price_at_sale, products(cost_price))")
        .gte("created_at", startISO);
      if (posErr) console.error("Erro PDV:", posErr);

      // 2. Fetch Site Orders (Only approved/paid)
      const { data: siteData, error: siteErr } = await supabase
        .from("orders")
        .select("*, order_items(quantity, price_at_purchase, products(cost_price))")
        .eq("payment_status", "approved")
        .gte("created_at", startISO);
      if (siteErr) console.error("Erro Site:", siteErr);

      // 3. Fetch Service Orders (Only delivered/paid)
      const { data: osData, error: osErr } = await supabase
        .from("service_orders")
        .select("*")
        .eq("status", "entregue")
        .gte("updated_at", startISO);
      if (osErr) console.error("Erro OS:", osErr);

      // 4. Fetch Cash Transactions
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      const { data: cashData, error: cashErr } = await supabase
        .from("cash_transactions")
        .select("*")
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false });
        
      if (cashErr) {
        console.error("Erro Caixa:", cashErr);
        toast({ title: "Tabela de Caixa não encontrada", description: "Você rodou o comando SQL no Supabase?", variant: "destructive" });
      }

      setTransactions(cashData || []);

      // === AGREGAR DADOS ===
      let rev = 0;
      let cost = 0;
      let count = 0;
      const methods = { dinheiro: 0, pix: 0, cartao: 0 };
      const origin = { pdv: 0, site: 0, os: 0 };

      // Processar PDV
      posData?.forEach(sale => {
        rev += Number(sale.total_amount);
        count++;
        origin.pdv += Number(sale.total_amount);
        
        // Mapear pagamento (pix, cartao, dinheiro)
        if (sale.payment_method === 'dinheiro') methods.dinheiro += Number(sale.total_amount);
        else if (sale.payment_method === 'pix') methods.pix += Number(sale.total_amount);
        else methods.cartao += Number(sale.total_amount);

        sale.pos_sale_items?.forEach((item: any) => {
          cost += (Number(item.products?.cost_price || 0) * item.quantity);
        });
      });

      // Processar Site
      siteData?.forEach(order => {
        rev += Number(order.total_price);
        count++;
        origin.site += Number(order.total_price);
        
        // Simulação: Site é sempre PIX ou Cartão (PagSeguro/MercadoPago etc)
        // Se a loja tiver opção de pagar na entrega, você ajusta aqui. Vamos colocar tudo como cartão para simplificar.
        methods.cartao += Number(order.total_price);

        order.order_items?.forEach((item: any) => {
          cost += (Number(item.products?.cost_price || 0) * item.quantity);
        });
      });

      // Processar OS
      osData?.forEach(os => {
        rev += Number(os.price);
        count++;
        origin.os += Number(os.price);
        // Assumindo recebimento diversificado da OS. Vamos jogar no Dinheiro como fallback, ou idealmente você teria um payment_method na OS.
        methods.dinheiro += Number(os.price);
        
        // Deduzir o custo das peças (se houver) do lucro bruto
        cost += Number(os.cost_price || 0);
      });

      // Calcular Dinheiro em Caixa (Apenas de Hoje)
      let drawer = 0;
      // Entradas = Vendas PDV em Dinheiro de HOJE + Vendas OS em dinheiro de HOJE + Suprimentos de HOJE
      
      const posToday = posData?.filter(s => new Date(s.created_at) >= todayStart && s.payment_method === 'dinheiro') || [];
      const osToday = osData?.filter(s => new Date(s.updated_at) >= todayStart) || []; // Assumindo OS em dinheiro
      
      drawer += posToday.reduce((acc, s) => acc + Number(s.total_amount), 0);
      drawer += osToday.reduce((acc, s) => acc + Number(s.price), 0);

      // Movimentações avulsas
      cashData?.forEach(tx => {
        if (tx.type === 'suprimento' || tx.type === 'abertura') drawer += Number(tx.amount);
        if (tx.type === 'sangria' || tx.type === 'fechamento') drawer -= Number(tx.amount);
      });

      setMetrics({
        totalRevenue: rev,
        totalProfit: rev - cost, // Lucro bruto (Não conta custos fixos como aluguel, mas serve de norte)
        salesCount: count,
        byMethod: methods,
        byOrigin: origin,
        cashDrawer: drawer
      });

    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao buscar relatórios", variant: "destructive" });
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const handleCashTx = async () => {
    if (!txAmount || isNaN(Number(txAmount))) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }

    setSavingTx(true);
    const { error } = await supabase.from("cash_transactions").insert({
      type: txType,
      amount: parseFloat(txAmount.replace(",", ".")),
      description: txDescription || (txType === 'sangria' ? 'Retirada de caixa' : 'Troco inicial')
    });

    setSavingTx(false);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Movimentação registrada com sucesso!" });
      setDialogOpen(false);
      setTxAmount("");
      setTxDescription("");
      fetchDashboardData();
    }
  };

  const handleFecharCaixa = async () => {
    if (metrics.cashDrawer <= 0) {
      toast({ title: "Caixa Vazio", description: "Não há dinheiro na gaveta para fechar." });
      return;
    }

    if (!confirm(`Tem certeza que deseja FECHAR O CAIXA e retirar R$ ${metrics.cashDrawer.toFixed(2)} da gaveta?`)) {
      return;
    }

    setSavingTx(true);
    const { error } = await supabase.from("cash_transactions").insert({
      type: "fechamento",
      amount: metrics.cashDrawer,
      description: "Fechamento de Caixa do Dia (Retirada Total)"
    });

    setSavingTx(false);

    if (error) {
      toast({ title: "Erro ao fechar caixa", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Caixa fechado com sucesso!", description: "A gaveta foi zerada." });
      fetchDashboardData();
    }
  };

  const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Dashboard de Vendas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Acompanhe o faturamento e fluxo de caixa da loja.</p>
        </div>
        
        <div className="flex bg-background rounded-lg border border-border p-1">
          <button 
            onClick={() => setPeriod("hoje")} 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${period === 'hoje' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Hoje
          </button>
          <button 
            onClick={() => setPeriod("semana")} 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${period === 'semana' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Esta Semana
          </button>
          <button 
            onClick={() => setPeriod("mes")} 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${period === 'mes' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Este Mês
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-muted-foreground">
          <RefreshCcw className="h-6 w-6 animate-spin mr-2" /> Carregando relatórios...
        </div>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-5 border border-border/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="h-16 w-16 text-primary" /></div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Faturamento Bruto</p>
              <h3 className="text-3xl font-bold text-foreground">{formatPrice(metrics.totalRevenue)}</h3>
              <p className="text-xs text-muted-foreground mt-2">{metrics.salesCount} vendas realizadas</p>
            </div>
            
            <div className="bg-card rounded-xl p-5 border border-border/50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="h-16 w-16 text-green-500" /></div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Lucro Aproximado</p>
              <h3 className="text-3xl font-bold text-green-500">{formatPrice(metrics.totalProfit)}</h3>
              <p className="text-xs text-muted-foreground mt-2">Faturamento - Preço de Custo</p>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border/50 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="h-20 w-20 text-orange-500" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Dinheiro em Caixa (Gaveta Hoje)</p>
                <h3 className="text-3xl font-bold text-orange-500 dark:text-orange-400">{formatPrice(metrics.cashDrawer)}</h3>
              </div>
              
              <div className="flex flex-col gap-2 mt-4 z-10">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-green-500/50 hover:bg-green-500/10 hover:text-green-600" onClick={() => { setTxType("suprimento"); setDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> Adicionar Troco
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-destructive/50 hover:bg-destructive/10 hover:text-destructive" onClick={() => { setTxType("sangria"); setDialogOpen(true); }}>
                    <Minus className="h-4 w-4 mr-1" /> Fazer Sangria
                  </Button>
                </div>
                <Button size="sm" variant="secondary" className="w-full mt-2" onClick={handleFecharCaixa} disabled={metrics.cashDrawer <= 0 || savingTx}>
                  Encerrar Dia (Zerar Gaveta)
                </Button>
              </div>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Por Forma de Pagamento */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-bold">Formas de Pagamento</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center"><QrCode className="h-5 w-5 text-blue-500" /></div>
                    <span className="font-medium">PIX</span>
                  </div>
                  <span className="font-bold">{formatPrice(metrics.byMethod.pix)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-orange-500" /></div>
                    <span className="font-medium">Cartão (Crédito/Débito)</span>
                  </div>
                  <span className="font-bold">{formatPrice(metrics.byMethod.cartao)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center"><Banknote className="h-5 w-5 text-green-500" /></div>
                    <span className="font-medium">Dinheiro Vivo</span>
                  </div>
                  <span className="font-bold">{formatPrice(metrics.byMethod.dinheiro)}</span>
                </div>
              </div>
            </div>

            {/* Por Origem */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-bold">Origem das Receitas</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Store className="h-5 w-5 text-primary" /></div>
                    <span className="font-medium">PDV (Balcão)</span>
                  </div>
                  <span className="font-bold">{formatPrice(metrics.byOrigin.pdv)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center"><Globe className="h-5 w-5 text-indigo-500" /></div>
                    <span className="font-medium">Loja Online (Pedidos)</span>
                  </div>
                  <span className="font-bold">{formatPrice(metrics.byOrigin.site)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center"><MonitorSmartphone className="h-5 w-5 text-purple-500" /></div>
                    <span className="font-medium">Assistência Técnica (OS)</span>
                  </div>
                  <span className="font-bold">{formatPrice(metrics.byOrigin.os)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Histórico de Caixa do Dia */}
          {transactions.length > 0 && (
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
               <div className="p-4 border-b border-border/50 bg-muted/20">
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Histórico de Caixa (Hoje)</h3>
               </div>
               <div className="divide-y divide-border/50">
                 {transactions.map(tx => (
                    <div key={tx.id} className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === 'suprimento' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                          {tx.type === 'suprimento' ? <Plus className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">{tx.description || '--'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className={`font-bold ${tx.type === 'suprimento' ? 'text-green-500' : 'text-destructive'}`}>
                           {(tx.type === 'sangria' || tx.type === 'fechamento') ? '-' : '+'}{formatPrice(tx.amount)}
                         </p>
                         <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                 ))}
               </div>
            </div>
          )}
        </>
      )}

      {/* Modal Sangria / Suprimento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{txType === 'sangria' ? 'Sangria (Retirada de Caixa)' : 'Suprimento (Adicionar Troco)'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
             <div className="bg-muted/30 p-3 rounded-lg border border-border text-sm mb-4">
                {txType === 'sangria' 
                  ? "A Sangria é utilizada quando você retira dinheiro do caixa (ex: para depósito no banco, pagamentos a fornecedores, etc)." 
                  : "O Suprimento é utilizado quando você coloca dinheiro no caixa (ex: para ter troco para o dia)."}
             </div>
             
             <div>
               <Label>Valor (R$)</Label>
               <Input 
                 type="number" 
                 placeholder="0.00" 
                 className="text-lg font-bold h-12"
                 value={txAmount}
                 onChange={(e) => setTxAmount(e.target.value)}
               />
             </div>
             <div>
               <Label>Motivo / Observação (Opcional)</Label>
               <Input 
                 placeholder={txType === 'sangria' ? 'Ex: Pagamento de fornecedor, Retirada para o banco' : 'Ex: Troco inicial do dia'}
                 value={txDescription}
                 onChange={(e) => setTxDescription(e.target.value)}
               />
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
             <Button 
               variant={txType === 'sangria' ? 'destructive' : 'default'} 
               onClick={handleCashTx} 
               disabled={savingTx}
             >
               {savingTx ? 'Registrando...' : 'Confirmar Registro'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
