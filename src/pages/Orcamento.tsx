import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, ArrowRight, User, Phone, Smartphone, Wrench, MapPin, Sparkles, ShieldCheck, Zap, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import mascot from "@/assets/mascot-chriscell.png";

const WHATSAPP_NUMBER = "5512981149421";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

const Orcamento = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    whatsapp: "",
    modelo: "",
    problema: "",
    bairro: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `*Orçamento Chriscell*%0A%0A*Nome:* ${form.nome}%0A*WhatsApp:* ${form.whatsapp}%0A*Modelo:* ${form.modelo}%0A*Problema:* ${form.problema}%0A*Bairro:* ${form.bairro}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    setSent(true);
  };

  const fieldClass =
    "peer w-full rounded-xl border border-border/60 bg-background/60 px-4 py-3.5 pl-11 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur-sm transition-all focus:border-primary/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30";

  const steps = [
    { n: "01", label: "Identificação" },
    { n: "02", label: "Aparelho" },
    { n: "03", label: "Entrega" },
  ];

  return (
    <>
      <Header />
      <WhatsAppFloat />
      <main className="min-h-screen pt-16">
        <section className="px-4 py-32 md:px-12 md:py-40">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-border/20 bg-background/20 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
            {/* ambient */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-primary/20 blur-[100px]" />
            <div className="pointer-events-none absolute -right-32 -bottom-32 h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[100px]" />

            <div className="relative grid gap-0 md:grid-cols-[1.05fr_1fr]">
              {/* LEFT — promo panel */}
              <div className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary/30 via-card to-background p-8 md:border-b-0 md:border-r md:p-12">
                <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(hsl(var(--foreground))_1px,transparent_1px)] [background-size:18px_18px]" />

                <span className="relative inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/40 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-primary backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" /> Orçamento Online
                </span>

                <h1 className="relative mt-8 font-display text-4xl font-extrabold tracking-tight leading-[1.05] text-foreground md:text-5xl lg:text-6xl">
                  Conserte seu<br />
                  celular com a<br />
                  <span className="text-gradient">Chriscell.</span>
                </h1>

                <p className="relative mt-6 max-w-sm text-sm md:text-base leading-relaxed text-muted-foreground font-light">
                  Preencha em menos de 1 minuto. Sua mensagem chega direto no nosso WhatsApp.
                </p>

                {/* trust badges */}
                <ul className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { icon: Clock, label: "Resposta em minutos" },
                    { icon: ShieldCheck, label: "Garantia em todos os serviços" },
                    { icon: Zap, label: "Reparo no mesmo dia" },
                    { icon: MapPin, label: "Coleta e entrega" },
                  ].map((b) => (
                    <li key={b.label} className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-background/40 px-3 py-2.5 backdrop-blur-sm">
                      <b.icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
                      <span className="text-xs text-foreground/85">{b.label}</span>
                    </li>
                  ))}
                </ul>

                {/* mascot */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none relative mt-10 hidden justify-center md:flex"
                >
                  <img src={mascot} alt="" className="h-48 w-auto drop-shadow-2xl" draggable={false} />
                </motion.div>
              </div>

              {/* RIGHT — form */}
              <div className="relative p-6 md:p-12">
                {/* step pills */}
                <div className="mb-8 flex items-center gap-2">
                  {steps.map((s, i) => (
                    <div key={s.n} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/70 backdrop-blur-sm">
                        <span className="text-primary">{s.n}</span>
                        <span className="hidden sm:inline">{s.label}</span>
                      </div>
                      {i < steps.length - 1 && <span className="h-px w-3 bg-border/60 sm:w-5" />}
                    </div>
                  ))}
                </div>

                {sent ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/5 ring-1 ring-primary/20 shadow-lg">
                      <CheckCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground">Orçamento enviado!</h2>
                    <p className="max-w-xs text-base text-muted-foreground font-light leading-relaxed">
                      Sua mensagem foi aberta no WhatsApp. Responderemos em breve!
                    </p>
                    <button onClick={() => setSent(false)} className="mt-4 inline-flex items-center gap-2 font-display text-sm font-bold tracking-wider uppercase text-primary hover:text-accent transition-colors">
                      Enviar outro orçamento <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground peer-focus:text-primary" />
                        <input
                          name="nome"
                          required
                          maxLength={100}
                          value={form.nome}
                          onChange={handleChange}
                          className={fieldClass}
                          placeholder="Seu nome"
                          aria-label="Nome"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          name="whatsapp"
                          required
                          maxLength={20}
                          value={form.whatsapp}
                          onChange={handleChange}
                          className={fieldClass}
                          placeholder="(11) 99999-9999"
                          aria-label="WhatsApp"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        name="modelo"
                        required
                        maxLength={100}
                        value={form.modelo}
                        onChange={handleChange}
                        className={fieldClass}
                        placeholder="Modelo do aparelho — ex: iPhone 13"
                        aria-label="Modelo"
                      />
                    </div>

                    {/* problem chips */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Qual o problema?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Tela quebrada", "Bateria viciada", "Não liga", "Não carrega", "Problema na câmera", "Outro"].map((p) => {
                          const active = form.problema === p;
                          return (
                            <button
                              type="button"
                              key={p}
                              onClick={() => setForm((f) => ({ ...f, problema: p }))}
                              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                                active
                                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                                  : "border-border/60 bg-background/60 text-foreground/80 hover:border-primary/40 hover:text-foreground"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                      {/* hidden required field to keep form validation */}
                      <input type="hidden" name="problema-required" required value={form.problema} readOnly />
                    </div>

                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        name="bairro"
                        required
                        maxLength={100}
                        value={form.bairro}
                        onChange={handleChange}
                        className={fieldClass}
                        placeholder="Bairro / Região"
                        aria-label="Bairro"
                      />
                    </div>

                    <button
                      type="submit"
                      className="group mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-5 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all duration-300 hover:shadow-[0_10px_30px_-10px_hsl(var(--primary))] hover:-translate-y-1"
                    >
                      Enviar via WhatsApp
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                    </button>

                    <p className="pt-2 text-center text-xs font-light text-muted-foreground">
                      Ao enviar, abriremos o WhatsApp com sua mensagem preenchida.
                    </p>
                  </motion.form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Orcamento;
