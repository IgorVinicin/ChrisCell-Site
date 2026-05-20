import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5512981149421";
const WHATSAPP_MESSAGE = encodeURIComponent("Olá, vim pelo site da Chriscell");

const WhatsAppFloat = () => (
  <a
    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary animate-pulse-glow transition-transform hover:scale-110"
    aria-label="Falar no WhatsApp"
  >
    <MessageCircle className="h-7 w-7 text-primary-foreground" />
  </a>
);

export default WhatsAppFloat;
