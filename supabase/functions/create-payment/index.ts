import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, paymentMethod, cpf, email, name, total, card } = await req.json();

    // 1. Initialize Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Fetch Mercado Pago Access Token
    const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!mpAccessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN env variable not set");
    }

    // 3. Create payment payload for Mercado Pago
    let mpPayload: any = {
      transaction_amount: parseFloat(total),
      description: `Pedido ChrisCell #${orderId}`,
      payer: {
        email: email,
        first_name: name.split(" ")[0] || name,
        last_name: name.split(" ").slice(1).join(" ") || "Silva",
        identification: {
          type: "CPF",
          number: cpf,
        },
      },
    };

    if (paymentMethod === "pix") {
      mpPayload.payment_method_id = "pix";
    } else {
      // Card payment mock/auth logic
      // In production, the card token is passed from frontend SDK
      mpPayload.payment_method_id = "master"; // fallback/mock card vendor
      mpPayload.installments = card?.installments || 1;
      mpPayload.token = "mock-card-token";
    }

    // 4. Send request to Mercado Pago API
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mpPayload),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      throw new Error(mpData.message || "Erro retornado pelo Mercado Pago");
    }

    // 5. Update order with payment details in Supabase database
    const updatePayload: any = {
      mercado_pago_payment_id: String(mpData.id),
    };

    // If card payment was approved instantly, update status
    if (paymentMethod === "card" && mpData.status === "approved") {
      updatePayload.payment_status = "approved";
    }

    const { error: dbError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (dbError) {
      console.error("Erro ao atualizar status do pedido no banco:", dbError);
    }

    // 6. Return response to frontend
    return new Response(
      JSON.stringify({
        id: mpData.id,
        status: mpData.status,
        qr_code: mpData.point_of_interaction?.transaction_data?.qr_code || null,
        qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64 || null,
        ticket_url: mpData.transaction_details?.external_resource_url || null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
