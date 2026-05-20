import { ShoppingCart, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const WHATSAPP_NUMBER = "5512981149421";

const parsePrice = (price: string) => {
  return parseFloat(price.replace("R$", "").replace(".", "").replace(",", ".").trim());
};

const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItems, isOpen, setIsOpen } = useCart();

  const total = items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0);

  const handleWhatsAppCheckout = () => {
    const lines = items.map((i) => `• ${i.quantity}x ${i.name} - ${i.price} cada`);
    const msg = `Olá! Gostaria de comprar:\n\n${lines.join("\n")}\n\n*Total: ${formatPrice(total)}*\n\nPodemos combinar o pagamento?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    clearCart();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Carrinho ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Seu carrinho está vazio
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
            {items.map((item) => (
              <div key={item.name} className="flex gap-3 rounded-lg border border-border/50 bg-card p-3">
                <img src={item.img} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm font-bold text-primary">{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.name, item.quantity - 1)}
                      className="rounded-md border border-border p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.name, item.quantity + 1)}
                      className="rounded-md border border-border p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.name)}
                      className="ml-auto rounded-md p-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-3 border-t border-border/50 pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
            <Button onClick={handleWhatsAppCheckout} className="w-full gap-2" size="lg">
              <MessageCircle className="h-5 w-5" /> Finalizar compra via WhatsApp
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
