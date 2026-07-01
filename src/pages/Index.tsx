import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Smartphone, Monitor, Battery, Wrench,
  Truck, Zap, ShieldCheck, Star, MessageCircle, ArrowRight, ShoppingCart,
} from "lucide-react";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import BlurImage from "@/components/BlurImage";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import heroBg from "@/assets/real-service-1.jpg";
import heroBg1024 from "@/assets/real-service-1-1024.jpg";
import heroBg640 from "@/assets/real-service-1-640.jpg";
import heroPhone from "@/assets/hero-phone-clean.png";
import mascot from "@/assets/mascot-chriscell.png";
import SEO from "@/components/SEO";

import serviceScreen from "@/assets/real-service-screen.jpg";
import serviceScreen1024 from "@/assets/real-service-screen-1024.jpg";
import serviceScreen640 from "@/assets/real-service-screen-640.jpg";
import serviceBattery from "@/assets/real-service-battery.jpg";
import serviceBattery1024 from "@/assets/real-service-battery-1024.jpg";
import serviceBattery640 from "@/assets/real-service-battery-640.jpg";
import serviceGeneral from "@/assets/real-service-general.jpg";
import serviceGeneral1024 from "@/assets/real-service-general-1024.jpg";
import serviceGeneral640 from "@/assets/real-service-general-640.jpg";

const PH = {
  hero: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAaABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwC2ZpDTXlkPU1Wa8AlC1JcSDysjrWsnFGFOE5rcmEuBRWQblwaKnmfY05UupAyt54bNXC+5QCapZNPUn1p3RFmtmWNq0VDmitOcy5PM/9k=",
  screen: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAPABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwBsFyJZcZqxcOFIwax0cI+Vp1zcNtBzWrmc3suyNhJjtFFY8V42wUVopxMnRmf/2Q==",
  battery: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAaABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCo251oWA7c4psVyu4DtWk8kPkcEZxVc7uZ+zVjO8uimNIdxxRXRY5blPymU09S/qann61EtSootzkOopaKsyP/2Q==",
  general: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAaABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwC39rHeoJpxIcCo3VTwDUBQq/BrW0TnvMvR2odQaKSO4KoBRV+zJ9sUnikxwajEUo7mry0+o5vIvkfcphXxRVuiq9oyPZI//9k=",
};

const buildSrcSet = (s640: string, s1024: string, s1600: string) =>
  `${s640} 640w, ${s1024} 1024w, ${s1600} 1600w`;

const WHATSAPP_NUMBER = "5511999999999";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const services = [
  { title: "Troca de Tela", desc: "Tela compatível com garantia. Conserto em até 1h.", img: serviceScreen, srcSet: buildSrcSet(serviceScreen640, serviceScreen1024, serviceScreen), placeholder: PH.screen, icon: Monitor },
  { title: "Troca de Bateria", desc: "Bateria nova com vida útil prolongada. Instalação rápida.", img: serviceBattery, srcSet: buildSrcSet(serviceBattery640, serviceBattery1024, serviceBattery), placeholder: PH.battery, icon: Battery },
  { title: "Conserto Geral", desc: "Placa, conector, botões, câmera e mais. Orçamento sem compromisso.", img: serviceGeneral, srcSet: buildSrcSet(serviceGeneral640, serviceGeneral1024, serviceGeneral), placeholder: PH.general, icon: Wrench },
];

const differentials = [
  { icon: Truck, title: "Retirada e Entrega", desc: "Buscamos e devolvemos seu celular consertado na sua região." },
  { icon: Zap, title: "Atendimento Rápido", desc: "Maioria dos reparos feitos no mesmo dia." },
  { icon: ShieldCheck, title: "Garantia no Serviço", desc: "Todos os consertos com garantia de até 90 dias." },
];

const testimonials = [
  { name: "Maria S.", text: "Trocaram a tela do meu iPhone em 40 minutos. Perfeito!", rating: 5 },
  { name: "Carlos R.", text: "Vieram buscar meu celular e devolveram no mesmo dia. Super prático!", rating: 5 },
  { name: "Ana L.", text: "Bateria nova e meu celular voltou a durar o dia todo. Recomendo!", rating: 5 },
];

const testimonialsLoop = [...testimonials, ...testimonials, ...testimonials];

const Index = () => {
  const { totalItems, setIsOpen: openCart } = useCart();
  return (
  <>
    <SEO />
    <CartDrawer />
    <WhatsAppFloat />

    <main>
      {/* Hero — Marshall-style editorial card */}
      <section className="px-3 py-6 md:px-8 md:py-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl">
          {/* background photo + gradient */}
          <div className="absolute inset-0">
            <BlurImage
              src={heroBg}
              srcSet={buildSrcSet(heroBg640, heroBg1024, heroBg)}
              sizes="100vw"
              placeholder={PH.hero}
              alt=""
              width={1920}
              height={1080}
              eager
              wrapperClassName="absolute inset-0"
              imgClassName="opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-primary/30" />
            <div className="absolute -bottom-32 left-1/2 h-[400px] w-[140%] -translate-x-1/2 rounded-[50%] bg-background/70 blur-2xl" />
          </div>

          {/* inner card header */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 pt-6 md:px-12 md:pt-8">
            <Link to="/" className="font-display text-xl italic tracking-tight text-foreground md:text-2xl">
              Chriscell
            </Link>
            <nav className="flex flex-wrap items-center gap-2 md:gap-4">
              <Link to="/loja" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/80 transition hover:text-foreground sm:text-xs">
                Loja
              </Link>
              <Link
                to="/orcamento"
                className="rounded-full border border-primary px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:px-5 md:text-xs"
              >
                Orçamento
              </Link>
              <button
                onClick={() => openCart(true)}
                aria-label="Abrir carrinho"
                className="relative text-foreground/80 transition-colors hover:text-primary"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* hero body */}
          <div className="relative z-10 grid items-center gap-8 px-6 pb-10 pt-12 md:grid-cols-2 md:px-12 md:pb-16 md:pt-16">
            {/* left: headline */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative pl-5 md:pl-6"
            >
              <span className="absolute left-0 top-1 h-[80%] w-[3px] rounded-full bg-primary" />
              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
                ChrisCell.<br />
                A assistência<br />
                que resolve seu celular.
              </h1>
            </motion.div>

            {/* right: clean phone product */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative flex items-end justify-center"
            >
              <div className="pointer-events-none absolute inset-0 m-auto h-[260px] w-[260px] rounded-full bg-primary/20 blur-3xl md:h-[340px] md:w-[340px]" />
              <div className="relative flex flex-col items-center">
                <motion.img
                  src={mascot}
                  alt="Mascote Chriscell"
                  width={420}
                  height={420}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-[240px] w-auto object-contain md:h-[340px]"
                  draggable={false}
                />
                {/* ground shadow */}
                <div className="-mt-2 h-3 w-[70%] rounded-[50%] bg-black/55 blur-md md:h-4" />
              </div>
            </motion.div>
          </div>

          {/* center CTA */}
          <div className="relative z-10 flex justify-center pb-10 md:pb-12">
            <Link
              to="/orcamento"
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-10 py-3 font-display text-xs font-bold uppercase tracking-[0.25em] text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:glow-primary-strong"
            >
              Orçamento Já
            </Link>
          </div>


          {/* tagline + feature icons */}
          <div className="relative z-10 border-t border-border/40 bg-background/40 px-6 py-10 backdrop-blur-sm md:px-12">
            <p className="mb-8 text-center font-display text-base text-foreground/90 md:text-lg">
              Tudo sobre o seu celular.
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
              {[
                { icon: Monitor, label: "Troca de tela\ncom garantia" },
                { icon: Battery, label: "Bateria nova\nde longa duração" },
                { icon: Wrench, label: "Reparo de placa\ne componentes" },
                { icon: Truck, label: "Coleta e entrega\nna sua casa" },
                { icon: ShieldCheck, label: "Garantia em\ntodos os serviços" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center text-center"
                >
                  <f.icon className="mb-3 h-7 w-7 text-primary" strokeWidth={1.6} />
                  <span className="whitespace-pre-line text-xs leading-snug text-muted-foreground">
                    {f.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services — zigzag fluid layout */}
      <section className="py-24">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16 text-center">
            <motion.span variants={fadeUp} custom={0} className="mb-3 block font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">Nossos Serviços</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
              Especialistas em <span className="text-gradient">smartphones</span>
            </motion.h2>
          </motion.div>

          <div className="relative flex flex-col gap-20 md:gap-28">
            {/* connecting line */}
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/30 to-transparent md:block" />

            {services.map((s, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${
                    isLeft ? "" : "md:[&>*:first-child]:order-2"
                  }`}
                >
                  {/* image — fluid blob */}
                  <div className="relative">
                    <div className={`absolute inset-0 -z-10 m-auto h-[85%] w-[85%] rounded-[40%_60%_55%_45%/55%_45%_60%_40%] bg-primary/20 blur-3xl ${isLeft ? "" : "md:translate-x-6"}`} />
                    <div
                      className={`group relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-card ring-1 ring-border/40 transition-all duration-500 hover:ring-primary/40 ${
                        isLeft
                          ? "rounded-[55%_45%_60%_40%/50%_55%_45%_50%] md:-rotate-3"
                          : "rounded-[45%_55%_40%_60%/55%_45%_55%_45%] md:rotate-3"
                      }`}
                    >
                      <BlurImage
                        src={s.img}
                        srcSet={s.srcSet}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder={s.placeholder}
                        alt={s.title}
                        width={800}
                        height={800}
                        wrapperClassName="h-full w-full"
                        imgClassName="h-full w-full object-cover brightness-[0.65] saturate-[0.85] transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/30 to-transparent" />
                      <div className="absolute inset-0 bg-[hsl(var(--primary)/0.15)] mix-blend-overlay" />
                    </div>
                  </div>

                  {/* text */}
                  <div className={`relative ${isLeft ? "md:pl-6" : "md:pr-6 md:text-right"}`}>
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20`}>
                      <s.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="mb-2 block font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">
                      0{i + 1} — Serviço
                    </span>
                    <h3 className="mb-4 font-display text-2xl font-bold text-foreground md:text-3xl">
                      {s.title}
                    </h3>
                    <p className="mb-6 max-w-md text-muted-foreground md:text-lg">
                      {s.desc}
                    </p>
                    <Link
                      to="/orcamento"
                      className={`inline-flex items-center gap-2 font-display text-sm font-semibold text-primary transition-all hover:gap-3 ${
                        isLeft ? "" : "md:flex-row-reverse"
                      }`}
                    >
                      Orçar este serviço <ArrowRight className={`h-4 w-4 ${isLeft ? "" : "md:rotate-180"}`} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Differentials */}
      <section className="relative overflow-hidden border-y border-border/50 bg-card py-24">
        {/* ambient blobs */}
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="container relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16 text-center">
            <motion.span variants={fadeUp} custom={0} className="mb-3 block font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">Por que a Chriscell?</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
              Diferenciais que <span className="text-gradient">fazem a diferença</span>
            </motion.h2>
          </motion.div>

          <div className="relative mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {differentials.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className={`group relative ${i === 1 ? "md:-translate-y-6" : i === 2 ? "md:translate-y-6" : ""}`}
              >
                {/* number badge */}
                <span className="absolute -top-4 left-6 z-10 rounded-full border border-primary/40 bg-background px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                  0{i + 1}
                </span>

                <div className="relative h-full overflow-hidden rounded-[28px] border border-border/60 bg-background/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:bg-background/80">
                  {/* corner glow */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/10 ring-1 ring-primary/30">
                    <d.icon className="h-7 w-7 text-foreground" strokeWidth={1.6} />
                  </div>

                  <h3 className="mb-3 font-display text-xl font-bold leading-tight text-foreground">
                    {d.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{d.desc}</p>

                  <div className="mt-6 h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pickup & Delivery */}
      <section className="py-20">
        <div className="container">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.span variants={fadeUp} custom={0} className="mb-2 block text-sm font-semibold text-primary">Coleta e Entrega</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
                Buscamos seu celular e devolvemos <span className="text-gradient">consertado</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="mb-4 text-muted-foreground">
                Sem sair de casa! Nosso motoboy vai até você, retira o aparelho, e devolvemos consertado no mesmo dia na maioria dos casos.
              </motion.p>
              <motion.ul variants={fadeUp} custom={3} className="mb-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Transporte seguro e rastreado</li>
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Entrega no mesmo dia</li>
                <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Taxa de deslocamento acessível</li>
              </motion.ul>
              <motion.div variants={fadeUp} custom={4}>
                <Link
                  to="/orcamento"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground glow-primary"
                >
                  Solicitar coleta <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden rounded-2xl border border-border/50"
            >
              <BlurImage
                src={heroBg}
                srcSet={buildSrcSet(heroBg640, heroBg1024, heroBg)}
                sizes="(max-width: 768px) 100vw, 50vw"
                placeholder={PH.hero}
                alt="Serviço de coleta e entrega"
                width={1200}
                height={640}
                wrapperClassName="h-full w-full"
                imgClassName="saturate-[0.95]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden border-y border-border/50 bg-card py-20">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12 text-center">
            <motion.span variants={fadeUp} custom={0} className="mb-3 block font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">Depoimentos</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
              O que nossos <span className="text-gradient">clientes dizem</span>
            </motion.h2>
          </motion.div>
        </div>

        {/* infinite carousel */}
        <div className="relative">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-card to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-card to-transparent" />

          <div className="flex w-max animate-marquee gap-6 px-6">
            {testimonialsLoop.map((t, i) => (
              <div
                key={i}
                className="flex w-[320px] shrink-0 flex-col rounded-2xl border border-border/60 bg-background/70 p-6 backdrop-blur-sm md:w-[380px]"
              >
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
                <span className="font-display text-sm font-semibold text-foreground">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center md:p-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
              Celular com problema? <span className="text-gradient">Resolva agora!</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mx-auto mb-8 max-w-md text-muted-foreground">
              Faça seu orçamento online e receba uma resposta rápida. Sem compromisso.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap justify-center gap-4">
              <Link
                to="/orcamento"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-display text-sm font-semibold text-primary-foreground glow-primary hover:glow-primary-strong"
              >
                Fazer orçamento <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá, vim pelo site da Chriscell")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-8 py-4 font-display text-sm font-semibold text-secondary-foreground"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>

    <Footer />
  </>
  );
};


export default Index;
