import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo-chriscell.png";
import { useCart } from "@/contexts/CartContext";

const AdminLogin = () => {
  const { isDbOffline } = useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      await supabase.auth.signOut();
      toast({ title: "Acesso negado", description: "Você não tem permissão de administrador.", variant: "destructive" });
      setLoading(false);
      return;
    }

    navigate("/admin");
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Email enviado!",
      description: "Se este email estiver cadastrado, você receberá o link de redefinição em alguns minutos.",
    });
    setMode("login");
    setResetEmail("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border/50 bg-card p-8">
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="Chriscell" className="h-14 w-14 rounded-lg object-cover" />
          <h1 className="font-display text-xl font-bold text-foreground">
            {mode === "login" ? "Painel Admin" : "Recuperar senha"}
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login"
              ? "Entre com suas credenciais"
              : "Enviaremos um link de redefinição para seu email"}
          </p>
        </div>
 
        {isDbOffline && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive text-center leading-relaxed">
            <strong>⚠️ Banco de Dados Suspenso:</strong>
            <p className="mt-1">
              O banco de dados gratuito do Supabase foi pausado por inatividade. Acesse o console do Supabase e clique em <em>Restore project</em> para reativar o sistema.
            </p>
          </div>
        )}

        {mode === "login" ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setResetEmail(email);
              }}
              className="block w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Esqueci minha senha
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Email cadastrado</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? "Enviando..." : "Enviar link de redefinição"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="block w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              ← Voltar para login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
