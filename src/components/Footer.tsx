import { MessageCircle, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-chriscell.png";

const WHATSAPP_NUMBER = "5512981149421";
const INSTAGRAM_URL = "https://instagram.com/chriscell.sjc";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <Link to="/" className="mb-4 flex items-center gap-2">
            <img src={logo} alt="Chriscell" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display text-lg font-bold text-foreground">
              CHRIS<span className="text-gradient">CELL</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Assistência técnica especializada em smartphones. Conserto rápido com garantia.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Av. Adonias da Silva 571 - Loja 2
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Início</Link>
            <Link to="/orcamento" className="text-sm text-muted-foreground hover:text-primary">Orçamento</Link>
            <Link to="/loja" className="text-sm text-muted-foreground hover:text-primary">Loja</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Contato</h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              @chriscell.sjc
            </a>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> Seg–Sáb: 9h–18h</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Av. Adonias da Silva 571 - Loja 2</span>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Chriscell. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;
