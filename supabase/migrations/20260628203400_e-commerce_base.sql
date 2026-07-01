-- Create enums for payment and shipping status
CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'refunded');
CREATE TYPE public.shipping_status AS ENUM ('pending', 'preparing', 'shipped', 'delivered', 'returned');

-- Alter products table to support inventory and active status
ALTER TABLE public.products ADD COLUMN stock_quantity INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.products ADD COLUMN active BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE public.products ADD CONSTRAINT check_stock_quantity_non_negative CHECK (stock_quantity >= 0);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address JSONB NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  shipping_status public.shipping_status NOT NULL DEFAULT 'pending',
  tracking_code TEXT,
  mercado_pago_payment_id TEXT,
  mercado_pago_preference_id TEXT,
  stock_returned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC(10,2) NOT NULL
);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Enable updated_at trigger for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function and trigger to handle automatic stock decrement when an order item is created
CREATE OR REPLACE FUNCTION public.handle_order_item_stock_decrement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER decrement_stock_on_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_item_stock_decrement();

-- Function and trigger to handle automatic stock replenishment on order cancellation/rejection
CREATE OR REPLACE FUNCTION public.handle_order_cancellation_stock_replenish()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  IF (NEW.payment_status = 'cancelled' OR NEW.payment_status = 'rejected') 
     AND OLD.payment_status NOT IN ('cancelled', 'rejected') 
     AND NEW.stock_returned = FALSE THEN
    
    FOR item IN 
      SELECT product_id, quantity FROM public.order_items WHERE order_id = NEW.id 
    LOOP
      IF item.product_id IS NOT NULL THEN
        UPDATE public.products
        SET stock_quantity = stock_quantity + item.quantity
        WHERE id = item.product_id;
      END IF;
    END LOOP;
    
    NEW.stock_returned := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER replenish_stock_on_order_cancellation
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_cancellation_stock_replenish();

-- Define RLS Policies for orders
CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own orders or admins can view all"
  ON public.orders FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') 
    OR user_id = auth.uid() 
    OR user_id IS NULL
  );

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Define RLS Policies for order_items
CREATE POLICY "Anyone can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users/Admins can view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_items.order_id 
      AND (
        public.has_role(auth.uid(), 'admin') 
        OR user_id = auth.uid() 
        OR user_id IS NULL
      )
    )
  );
