import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Circle, Search, Package, ArrowLeft, Smartphone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { maskCPF } from "@/lib/utils";

// Define OS steps
const STEPS = [
  { id: "pendente", label: "Na fila" },
  { id: "aprovado", label: "Orçamento Aprovado" },
  { id: "reparando", label: "Na Bancada / Consertando" },
  { id: "pronto", label: "Pronto para Retirada" },
  { id: "entregue", label: "Aparelho Entregue" },
];

export default function OsStatus() {
  const { id } = useParams<{ id: string }>();
  const [os, setOs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    if (id) {
      fetchOs(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchOs = async (osId: string) => {
    setLoading(true);
    setError(false);
    const { data, error: sbError } = await supabase
      .from("service_orders")
      .select("*")
      .eq("customer_cpf", osId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sbError || !data) {
      setError(true);
    } else {
      setOs(data);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      window.location.href = `/os/${searchId.trim()}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="animate-pulse">Buscando sua ordem de serviço...</p>
      </div>
    );
  }

  if (!os) {
    return (
      <div className="min-h-screen bg-background p-6">
        <SEO title="Rastrear Ordem de Serviço | ChrisCell" />
        <div className="mx-auto max-w-md pt-20">
          <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o site
          </Link>
          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
              Acompanhar Reparo
            </h1>
            <p className="mb-8 text-center text-sm text-muted-foreground">
              Digite o seu CPF para ver o andamento do conserto do seu aparelho.
            </p>
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                placeholder="000.000.000-00"
                value={searchId}
                maxLength={14}
                onChange={(e) => setSearchId(maskCPF(e.target.value))}
                className="h-12 font-mono text-center text-lg tracking-wider"
              />
              <Button type="submit" className="h-12 w-full glow-primary">
                Buscar Ordem
              </Button>
            </form>
            {error && (
              <p className="mt-4 text-center text-sm text-destructive">
                Ordem de serviço não encontrada. Verifique o número digitado.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Find current step index
  const currentStepIndex = STEPS.findIndex((s) => s.id === os.status);

  return (
    <div className="min-h-screen bg-background p-6">
      <SEO title={`OS ${os.device_model} | ChrisCell`} />
      
      <div className="mx-auto max-w-2xl pt-10 pb-20">
        <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o site
        </Link>
        
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-primary/5 p-6 md:p-8 border-b border-border/50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="h-6 w-6 text-primary" />
                  {os.device_model}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">OS de {os.customer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">CPF do Cliente</p>
                <p className="font-mono text-xs text-foreground bg-background/50 p-2 rounded border border-border/50">{os.customer_cpf}</p>
              </div>
            </div>

            <div className="bg-background rounded-xl p-4 border border-border/30 text-sm">
              <span className="font-bold text-foreground block mb-1">Defeito relatado:</span>
              <p className="text-muted-foreground">{os.issue_description}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 md:p-10">
            <h3 className="font-display text-lg font-bold mb-8">Status do Reparo</h3>
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute bottom-6 left-[1.35rem] top-2 w-[2px] bg-border/50" />

              <div className="space-y-8">
                {STEPS.map((step, index) => {
                  const isCompleted = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;

                  return (
                    <div key={step.id} className="relative flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background transition-colors ${
                          isCompleted ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className={`h-6 w-6 ${isCurrent ? "animate-pulse" : ""}`} />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1">
                        <p
                          className={`font-semibold transition-colors ${
                            isCurrent
                              ? "text-primary text-base"
                              : isCompleted
                              ? "text-foreground text-sm"
                              : "text-muted-foreground text-sm"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && step.id === "pronto" && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Seu aparelho já pode ser retirado na loja!
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="bg-primary/5 p-6 border-t border-border/50 flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <ShieldCheck className="h-5 w-5 text-primary" />
               Garantia do serviço: <span className="font-bold text-foreground">{os.warranty_days} dias</span>
             </div>
             <div className="text-lg">
                Total: <span className="font-bold text-primary">{os.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
