import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Trash2, Pencil, Plus, Minus, LogOut, Upload, AlertTriangle, MonitorSmartphone, Store, Search, Filter, TrendingUp } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/logo-chriscell.png";
import { useCart } from "@/contexts/CartContext";
import OsTab from "@/components/admin/OsTab";
import PosTab from "@/components/admin/PosTab";
import ReportsTab from "@/components/admin/ReportsTab";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  description?: string | null;
  stock_quantity: number;
  min_stock_quantity?: number;
  cost_price?: number;
  active: boolean;
}

const CATEGORIES = ["Capinhas", "Películas", "Carregadores", "Cabos", "Fones", "Outros"];

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isDbOffline } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ 
    name: "", price: "", cost_price: "0", category: "Capinhas", custom_category: "",
    image_url: "", description: "", stock_quantity: "0", min_stock_quantity: "3", active: true 
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<"products" | "orders" | "pos" | "os" | "reports">("reports");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Filtros e Paginação - Produtos
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [productFilterCat, setProductFilterCat] = useState("Todas");

  // Filtros e Paginação - Pedidos
  const [orderPage, setOrderPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    checkAdmin();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin/login"); return; }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) { navigate("/admin/login"); }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(*))")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao buscar pedidos", description: error.message, variant: "destructive" });
    } else {
      setOrders(data || []);
    }
    setLoadingOrders(false);
  };

  const handleUpdateOrderStatus = async (orderId: string, field: string, value: string) => {
    const order = orders.find(o => o.id === orderId);

    // Regra de negócio: Não enviar/entregar se não estiver pago
    if (field === "shipping_status" && ["shipped", "delivered"].includes(value)) {
      if (order?.payment_status !== "approved") {
        toast({ 
          title: "Ação bloqueada", 
          description: "O pagamento precisa estar 'Aprovado' antes de enviar ou entregar o produto.", 
          variant: "destructive" 
        });
        return;
      }
    }

    let stockDeducted = order?.stock_deducted || false;
    let shouldDeductNow = false;

    // Lógica de Baixa Automática
    if (field === "shipping_status" && value === "delivered" && !stockDeducted && order?.payment_status === "approved") {
      shouldDeductNow = true;
      stockDeducted = true;
    }

    const payload: any = { [field]: value };
    if (shouldDeductNow) {
      payload.stock_deducted = true;
    }

    const { error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", orderId);
      
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      if (shouldDeductNow && order?.order_items) {
        // Descontar estoque
        for (const item of order.order_items) {
          if (item.product_id) {
            await supabase.rpc('decrease_stock', { p_id: item.product_id, qty: item.quantity });
          }
        }
        toast({ title: "Pedido entregue!", description: "Estoque atualizado automaticamente." });
      } else {
        toast({ title: "Pedido atualizado!" });
      }
      fetchOrders();
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", price: "", cost_price: "0", category: "Capinhas", custom_category: "", image_url: "", description: "", stock_quantity: "0", min_stock_quantity: "3", active: true });
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      cost_price: String(p.cost_price ?? 0),
      category: CATEGORIES.includes(p.category) ? p.category : "Outros",
      custom_category: CATEGORIES.includes(p.category) ? "" : p.category,
      image_url: p.image_url || "",
      description: p.description || "",
      stock_quantity: String(p.stock_quantity ?? 0),
      min_stock_quantity: String(p.min_stock_quantity ?? 3),
      active: p.active ?? true,
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); return null; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast({ title: "Preencha nome e preço", variant: "destructive" });
      return;
    }
    setSaving(true);

    let imageUrl = form.image_url;
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) imageUrl = url;
    }

    const finalCategory = form.category === "Outros" && form.custom_category.trim() !== "" 
      ? form.custom_category.trim() 
      : form.category;

    const payload = {
      name: form.name,
      price: parseFloat(form.price.replace(",", ".")),
      cost_price: parseFloat(form.cost_price.replace(",", ".")),
      category: finalCategory,
      image_url: imageUrl || null,
      description: form.description || null,
      stock_quantity: parseInt(form.stock_quantity || "0", 10),
      min_stock_quantity: parseInt(form.min_stock_quantity || "3", 10),
      active: form.active,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Produto atualizado!" });
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Produto criado com sucesso!" });
        // Limpar formulário para cadastro contínuo e não fechar o modal
        setForm({ name: "", price: "", cost_price: "0", category: "Capinhas", custom_category: "", image_url: "", description: "", stock_quantity: "0", min_stock_quantity: "3", active: true });
        setImageFile(null);
        // Tentar jogar o scroll do modal pro topo
        setTimeout(() => {
          const dialogs = document.querySelectorAll('[role="dialog"]');
          dialogs.forEach(d => d.scrollTo({ top: 0, behavior: 'smooth' }));
        }, 100);
      }
    }

    setSaving(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    else { toast({ title: "Produto excluído!" }); fetchProducts(); }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    if (newStock < 0) return;
    const { error } = await supabase.from("products").update({ stock_quantity: newStock }).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchProducts(); // Refresh products
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // === Lógica de Filtros e Paginação ===
  
  // Produtos
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productFilterCat === "Todas" || p.category === productFilterCat;
    return matchesSearch && matchesCat;
  });
  const paginatedProducts = filteredProducts.slice((productPage - 1) * ITEMS_PER_PAGE, productPage * ITEMS_PER_PAGE);
  const totalProductPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  // Pedidos
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) || o.id.includes(orderSearch);
    if (!matchesSearch) return false;
    
    if (orderStatusFilter === "all") return true;
    if (orderStatusFilter === "pending") return o.payment_status === "pending" && o.shipping_status !== "delivered";
    if (orderStatusFilter === "paid") return o.payment_status === "approved" && o.shipping_status !== "delivered" && o.shipping_status !== "returned";
    if (orderStatusFilter === "delivered") return o.shipping_status === "delivered";
    if (orderStatusFilter === "cancelled") return ['cancelled', 'rejected', 'refunded'].includes(o.payment_status) || (o.shipping_status === 'returned' && o.shipping_status !== 'delivered');
    return true;
  });
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE);
  const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;

  const PaginationControls = ({ page, totalPages, setPage }: { page: number, totalPages: number, setPage: (p: number) => void }) => (
    <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
      <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
      </div>
    </div>
  );

  const OrderCard = ({ order }: { order: any }) => (
    <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col md:flex-row justify-between gap-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Cliente: {order.customer_name}</p>
        <p className="text-xs text-muted-foreground">Pedido: <span className="font-mono">{order.id}</span></p>
        <p className="text-xs text-muted-foreground">Data: {new Date(order.created_at).toLocaleString("pt-BR")}</p>
        <p className="text-sm font-bold text-primary">Total: {formatPrice(order.total_price)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Pagamento</span>
          <select
            value={order.payment_status}
            onChange={(e) => handleUpdateOrderStatus(order.id, "payment_status", e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Recusado</option>
            <option value="cancelled">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Entrega</span>
          <select
            value={order.shipping_status}
            onChange={(e) => handleUpdateOrderStatus(order.id, "shipping_status", e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
          >
            <option value="pending">Pendente</option>
            <option value="preparing">Preparando</option>
            <option value="shipped" disabled={order.payment_status !== "approved"}>Enviado</option>
            <option value="delivered" disabled={order.payment_status !== "approved"}>Entregue</option>
            <option value="returned">Devolvido</option>
          </select>
        </div>

        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
          Detalhes
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex gap-4">
            <Button variant={activeTab === "products" ? "default" : "ghost"} onClick={() => setActiveTab("products")}>
              Produtos
            </Button>
            <Button variant={activeTab === "orders" ? "default" : "ghost"} onClick={() => setActiveTab("orders")}>
              Pedidos Site
            </Button>
            <Button variant={activeTab === "pos" ? "default" : "ghost"} onClick={() => setActiveTab("pos")}>
              <Store className="mr-2 h-4 w-4" /> PDV
            </Button>
            <Button variant={activeTab === "os" ? "default" : "ghost"} onClick={() => setActiveTab("os")}>
              <MonitorSmartphone className="mr-2 h-4 w-4" /> OS
            </Button>
            <Button variant={activeTab === "reports" ? "default" : "ghost"} onClick={() => setActiveTab("reports")}>
              <TrendingUp className="mr-2 h-4 w-4" /> Caixa/Relatórios
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="container py-8">
        {isDbOffline && (
          <div className="mb-6 rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive leading-relaxed">
            <strong>⚠️ Banco de Dados Suspenso por Inatividade:</strong>
            <p className="mt-1">
              O banco de dados gratuito do Supabase associado a este projeto foi pausado automaticamente por inatividade. 
              Para reativar a loja e visualizar/gerenciar produtos e pedidos, acesse o painel do Supabase, selecione o projeto e clique no botão <strong>Restore project</strong>.
            </p>
          </div>
        )}
        {activeTab === "products" && (
          <>
            {products.filter(p => p.stock_quantity <= (p.min_stock_quantity ?? 3)).length > 0 && (
              <div className="mb-6 rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 flex items-start gap-3 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold">Atenção: Estoque Baixo</h4>
                  <p className="text-sm mt-1">Existem {products.filter(p => p.stock_quantity <= (p.min_stock_quantity ?? 3)).length} produto(s) atingindo o estoque mínimo.</p>
                </div>
              </div>
            )}
            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-foreground">Produtos</h2>
              <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Novo Produto</Button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar produto por nome..." 
                  className="pl-9"
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-[180px]"
                  value={productFilterCat}
                  onChange={(e) => { setProductFilterCat(e.target.value); setProductPage(1); }}
                >
                  <option value="Todas">Todas as Categorias</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-muted-foreground">Nenhum produto encontrado com esses filtros.</p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedProducts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.name} className="h-40 w-full object-cover" />
                    )}
                    <div className="p-4">
                      <span className="mb-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{p.category}</span>
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <p className="text-lg font-bold text-primary">{formatPrice(p.price)}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Estoque:</span>
                        <div className="flex items-center gap-1 bg-background border border-border/60 rounded-md px-1 py-0.5">
                          <button onClick={(e) => { e.stopPropagation(); handleUpdateStock(p.id, p.stock_quantity - 1); }} className="p-0.5 hover:text-primary text-muted-foreground"><Minus className="h-3 w-3" /></button>
                          <span className="text-xs font-bold w-6 text-center">{p.stock_quantity}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleUpdateStock(p.id, p.stock_quantity + 1); }} className="p-0.5 hover:text-primary text-muted-foreground"><Plus className="h-3 w-3" /></button>
                        </div>
                        <span className="text-[10px] uppercase text-muted-foreground ml-auto">{p.active ? "Ativo" : "Inativo"}</span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                          <Pencil className="mr-1 h-3 w-3" /> Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="mr-1 h-3 w-3" /> Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <PaginationControls page={productPage} totalPages={totalProductPages} setPage={setProductPage} />
            </>
            )}
          </>
        )}
        
        {activeTab === "orders" && (
          <>
            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-foreground">Pedidos do Site</h2>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar pedido por ID ou cliente..." 
                  className="pl-9"
                  value={orderSearch}
                  onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-[200px]"
                  value={orderStatusFilter}
                  onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
                >
                  <option value="all">Todos os Pedidos</option>
                  <option value="pending">⏳ Aguardando Pagamento</option>
                  <option value="paid">📦 Pagos / A Enviar</option>
                  <option value="delivered">✅ Entregues / Finalizados</option>
                  <option value="cancelled">❌ Cancelados / Devolvidos</option>
                </select>
              </div>
            </div>

            {loadingOrders ? (
              <p className="text-muted-foreground">Carregando pedidos...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-muted-foreground">Nenhum pedido encontrado com esses filtros.</p>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedOrders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
                <PaginationControls page={orderPage} totalPages={totalOrderPages} setPage={setOrderPage} />
              </>
            )}
          </>
        )}
        
        {activeTab === "pos" && <PosTab />}
        {activeTab === "os" && <OsTab />}
        {activeTab === "reports" && <ReportsTab />}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço de Venda (R$)</Label>
                <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="39.90" />
              </div>
              <div>
                <Label>Preço de Custo (R$)</Label>
                <Input value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} placeholder="15.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estoque Atual (Unidades)</Label>
                <Input type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} placeholder="10" />
              </div>
              <div>
                <Label>Estoque Mínimo (Alerta)</Label>
                <Input type="number" min="0" value={form.min_stock_quantity} onChange={(e) => setForm({ ...form, min_stock_quantity: e.target.value })} placeholder="3" />
              </div>
            </div>
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="active" className="cursor-pointer">Produto Ativo (Visível na loja)</Label>
            </div>
            <div>
              <Label>Categoria</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {form.category === "Outros" && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                  <Input 
                    placeholder="Digite o nome da categoria..." 
                    value={form.custom_category} 
                    onChange={(e) => setForm({ ...form, custom_category: e.target.value })} 
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalhes sobre o produto, especificações, etc..."
              />
            </div>
            <div>
              <Label>Imagem</Label>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                  <Upload className="h-4 w-4" />
                  {imageFile ? imageFile.name : "Escolher arquivo"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              {form.image_url && !imageFile && (
                <img src={form.image_url} alt="Preview" className="mt-2 h-20 w-20 rounded object-cover" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Cliente</p>
                  <p className="text-sm font-semibold text-foreground">{selectedOrder.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.customer_email}</p>
                  <p className="text-xs text-muted-foreground">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Endereço de Entrega</p>
                  <p className="text-xs text-foreground mt-1">
                    {selectedOrder.delivery_address.rua}, {selectedOrder.delivery_address.numero}
                    {selectedOrder.delivery_address.complemento && ` - ${selectedOrder.delivery_address.complemento}`}
                  </p>
                  <p className="text-xs text-foreground">
                    {selectedOrder.delivery_address.bairro} - {selectedOrder.delivery_address.cidade}/{selectedOrder.delivery_address.estado}
                  </p>
                  <p className="text-xs text-muted-foreground">CEP: {selectedOrder.delivery_address.cep}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Itens Comprados</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-background/50 border border-border/30 rounded-lg p-2.5 text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{item.products?.name || "Produto Removido"}</p>
                        <p className="text-muted-foreground">{item.quantity}x {formatPrice(item.price_at_purchase)}</p>
                      </div>
                      <p className="font-bold text-primary">{formatPrice(item.price_at_purchase * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/40 pt-3 flex justify-between font-bold text-sm">
                <span>Total Pago</span>
                <span className="text-primary text-base">{formatPrice(selectedOrder.total_price)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedOrder(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
