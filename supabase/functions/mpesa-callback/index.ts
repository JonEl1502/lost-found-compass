
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    
    // Parse the request body
    const callbackData = await req.json();
    console.log("Callback data:", JSON.stringify(callbackData));
    
    // Process the callback data
    if (callbackData.Body && callbackData.Body.stkCallback) {
      const { ResultCode, ResultDesc, CallbackMetadata } = callbackData.Body.stkCallback;
      
      // If the transaction was successful
      if (ResultCode === 0) {
        // Extract payment details
        const Amount = CallbackMetadata.Item.find((item) => item.Name === "Amount")?.Value;
        const MpesaReceiptNumber = CallbackMetadata.Item.find((item) => item.Name === "MpesaReceiptNumber")?.Value;
        const TransactionDate = CallbackMetadata.Item.find((item) => item.Name === "TransactionDate")?.Value;
        const PhoneNumber = CallbackMetadata.Item.find((item) => item.Name === "PhoneNumber")?.Value;
        
        // Extract item ID from AccountReference
        const AccountReference = callbackData.Body.stkCallback.AccountReference;
        const itemId = AccountReference.replace("Item-", "");
        
        // Find the claim for this item
        const { data: claimData, error: claimError } = await supabase
          .from("claims")
          .select("*")
          .eq("item_id", itemId)
          .eq("status", "pre-claimed")
          .order("claim_date", { ascending: false })
          .limit(1);
        
        if (claimError) {
          console.error("Error finding claim:", claimError.message);
          return new Response(
            JSON.stringify({ success: false, error: claimError.message }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            }
          );
        }
        
        if (claimData && claimData.length > 0) {
          const claim = claimData[0];
          
          // Update the claim with the tip information
          const { error: updateError } = await supabase
            .from("claims")
            .update({
              tip_amount: Amount,
              status: "claimed",
              tip_message: `Paid ${Amount} via M-Pesa. Receipt: ${MpesaReceiptNumber}`
            })
            .eq("id", claim.id);
          
          if (updateError) {
            console.error("Error updating claim:", updateError.message);
            return new Response(
              JSON.stringify({ success: false, error: updateError.message }),
              {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                  ...corsHeaders,
                },
              }
            );
          }
          
          // Update the item status
          const { error: itemError } = await supabase
            .from("items")
            .update({ status: "claimed" })
            .eq("id", itemId);
          
          if (itemError) {
            console.error("Error updating item:", itemError.message);
          }
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error processing callback:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
