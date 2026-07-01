import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const body = await req.json();

    console.log("Notificação recebida do Mercado Pago:", body);

    // Mercado Pago webhook notifications send the ID in body.data.id
    const paymentId = body.data?.id || body.resource?.split("/").pop();
    const topic = body.type || body.topic;

    if (topic === "payment" && paymentId) {
      // 1. Initialize Supabase Client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // 2. Fetch Mercado Pago Access Token
      const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
      if (!mpAccessToken) {
        throw new Error("MERCADO_PAGO_ACCESS_TOKEN env variable not set");
      }

      // 3. Fetch fresh payment data from Mercado Pago
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${mpAccessToken}`,
        },
      });

      if (!mpRes.ok) {
        throw new Error(`Erro ao buscar pagamento ${paymentId} no Mercado Pago`);
      }

      const paymentData = await mpRes.json();
      console.log(`Status atualizado do pagamento ${paymentId}:`, paymentData.status);

      // Map Mercado Pago status to our database status
      // MP Statuses: pending, approved, in_process, rejected, cancelled, refunded
      let mappedStatus = "pending";
      if (paymentData.status === "approved") {
        mappedStatus = "approved";
      } else if (paymentData.status === "rejected") {
        mappedStatus = "rejected";
      } else if (paymentData.status === "cancelled") {
        mappedStatus = "cancelled";
      } else if (paymentData.status === "refunded") {
        mappedStatus = "refunded";
      }

      // 4. Update the order table
      const { data, error } = await supabase
        .from("orders")
        .update({ payment_status: mappedStatus })
        .eq("mercado_pago_payment_id", String(paymentId))
        .select();

      if (error) {
        console.error("Erro ao atualizar banco de dados:", error);
      } else {
        console.log("Banco de dados atualizado com sucesso:", data);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Erro no Webhook:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
