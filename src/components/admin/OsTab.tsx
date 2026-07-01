import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { maskCPF, maskPhone } from "@/lib/utils";

export interface ServiceOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_cpf: string | null;
  customer_address: string | null;
  device_model: string;
  issue_description: string;
  status: string;
  price: number;
  cost_price?: number;
  warranty_days: number;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "reparando", label: "Na Bancada" },
  { value: "pronto", label: "Pronto para Retirada" },
  { value: "entregue", label: "Entregue" },
];

export default function OsTab() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceOrder | null>(null);
  
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_cpf: "",
    customer_address: "",
    device_model: "",
    issue_description: "",
    status: "pendente",
    price: "0",
    cost_price: "0",
    warranty_days: "90"
  });

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_orders")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      toast({ title: "Erro ao buscar OS", description: error.message, variant: "destructive" });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({
      customer_name: "",
      customer_phone: "",
      customer_cpf: "",
      customer_address: "",
      device_model: "",
      issue_description: "",
      status: "pendente",
      price: "0",
      cost_price: "0",
      warranty_days: "90"
    });
    setDialogOpen(true);
  };

  const openEdit = (os: ServiceOrder) => {
    setEditing(os);
    setForm({
      customer_name: os.customer_name,
      customer_phone: os.customer_phone,
      customer_cpf: os.customer_cpf || "",
      customer_address: os.customer_address || "",
      device_model: os.device_model,
      issue_description: os.issue_description,
      status: os.status,
      price: os.price.toString(),
      cost_price: (os.cost_price || 0).toString(),
      warranty_days: os.warranty_days.toString(),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.customer_name || !form.device_model || !form.issue_description) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }

    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_cpf: form.customer_cpf || null,
      customer_address: form.customer_address || null,
      device_model: form.device_model,
      issue_description: form.issue_description,
      status: form.status,
      price: parseFloat(form.price.replace(",", ".")),
      cost_price: parseFloat(form.cost_price.replace(",", ".")),
      warranty_days: parseInt(form.warranty_days, 10),
    };

    if (editing) {
      const { error } = await supabase.from("service_orders").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      else { toast({ title: "OS atualizada!" }); setDialogOpen(false); fetchOrders(); }
    } else {
      const { error } = await supabase.from("service_orders").insert(payload);
      if (error) toast({ title: "Erro ao criar OS", description: error.message, variant: "destructive" });
      else { toast({ title: "OS criada!" }); setDialogOpen(false); fetchOrders(); }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta OS?")) return;
    const { error } = await supabase.from("service_orders").delete().eq("id", id);
    if (error) toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    else { toast({ title: "OS excluída!" }); fetchOrders(); }
  };

  const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const getStatusLabel = (val: string) => STATUS_OPTIONS.find((s) => s.value === val)?.label || val;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">Ordens de Serviço</h2>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Nova OS</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando OS...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma Ordem de Serviço encontrada.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((os) => (
            <div key={os.id} className="rounded-xl border border-border/50 bg-card p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary uppercase">
                  {getStatusLabel(os.status)}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(os.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <h3 className="font-bold text-foreground truncate">{os.device_model}</h3>
              <p className="text-sm text-foreground/80 mb-2">{os.customer_name}</p>
              
              <div className="bg-background/50 rounded-lg p-2 mb-4">
                <p className="text-xs text-muted-foreground line-clamp-2">{os.issue_description}</p>
              </div>
              
              <div className="flex justify-between items-center mt-auto">
                <span className="font-bold text-primary">{formatPrice(os.price)}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => openEdit(os)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(os.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono break-all">ID: {os.id}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar OS" : "Nova OS"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <Label>Nome do Cliente *</Label>
              <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.customer_phone} maxLength={15} onChange={(e) => setForm({ ...form, customer_phone: maskPhone(e.target.value) })} placeholder="(12) 99999-9999" />
            </div>
            <div>
              <Label>CPF do Cliente (Para rastreio)</Label>
              <Input value={form.customer_cpf} maxLength={14} onChange={(e) => setForm({ ...form, customer_cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" />
            </div>
            <div>
              <Label>Modelo do Aparelho *</Label>
              <Input value={form.device_model} onChange={(e) => setForm({ ...form, device_model: e.target.value })} placeholder="iPhone 13 / S23 Ultra" />
            </div>
            
            <div className="col-span-2">
              <Label>Endereço do Cliente</Label>
              <Input value={form.customer_address} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} placeholder="Rua, Número, Bairro, CEP" />
            </div>
            
            <div className="col-span-2">
              <Label>Defeito Relatado *</Label>
              <Textarea
                value={form.issue_description}
                onChange={(e) => setForm({ ...form, issue_description: e.target.value })}
                placeholder="Detalhes do problema, senhas de desbloqueio, marcas de uso..."
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Preço do Reparo (Cobrado do Cliente) (R$)</Label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="150.00" />
            </div>
            <div>
              <Label>Custo das Peças (Visível só para você) (R$)</Label>
              <Input value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} placeholder="50.00" />
            </div>
            <div>
              <Label>Garantia (Dias)</Label>
              <Input type="number" value={form.warranty_days} onChange={(e) => setForm({ ...form, warranty_days: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar OS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
