import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo-chriscell.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase coloca o token de recovery no hash da URL e dispara PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    // Caso já exista sessão ao entrar (usuário clicou no link recente)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Senha muito curta", description: "Use no mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Senhas não conferem", description: "Confirme a mesma senha.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao redefinir", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Senha redefinida!", description: "Faça login com a nova senha." });
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border/50 bg-card p-8">
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="Chriscell" className="h-14 w-14 rounded-lg object-cover" />
          <h1 className="font-display text-xl font-bold text-foreground">Redefinir senha</h1>
          <p className="text-center text-sm text-muted-foreground">
            {ready ? "Digite sua nova senha" : "Validando link de recuperação..."}
          </p>
        </div>

        {ready && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Nova senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Redefinir senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
