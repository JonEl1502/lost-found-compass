
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle OPTIONS requests for CORS
function handleOptions() {
  return new Response(null, {
    headers: {
      ...corsHeaders,
    },
    status: 204,
  });
}

// Generate timestamp in the format YYYYMMDDHHmmss
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Get access token from Safaricom
async function getAccessToken() {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY") || "";
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET") || "";
  
  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing M-Pesa credentials");
  }
  
  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  
  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );
  
  const { access_token } = await response.json();
  return access_token;
}

// Initiate STK Push
async function initiateSTKPush(phoneNumber: string, amount: number, accountReference: string, description: string) {
  const accessToken = await getAccessToken();
  const timestamp = getTimestamp();
  const shortCode = Deno.env.get("MPESA_BUSINESS_SHORT_CODE") || "";
  const passkey = Deno.env.get("MPESA_PASSKEY") || "";
  
  if (!shortCode || !passkey) {
    throw new Error("Missing M-Pesa credentials");
  }
  
  // Format the phone number (remove leading 0 or +254 and add 254)
  const formattedPhone = phoneNumber.replace(/^(0|\+254)/, "254");
  
  // Generate password (base64 of shortcode + passkey + timestamp)
  const password = btoa(shortCode + passkey + timestamp);
  
  const response = await fetch(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: "https://agyxtvarmnpxqvsdiejm.supabase.co/functions/v1/mpesa-callback",
        AccountReference: accountReference,
        TransactionDesc: description,
      }),
    }
  );
  
  return await response.json();
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleOptions();
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
    
    const { phoneNumber, amount, itemId, claimId } = await req.json();
    
    if (!phoneNumber || !amount || !itemId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    
    const accountReference = `Item-${itemId}`;
    const description = `Tip for found item ${itemId}`;
    
    const result = await initiateSTKPush(
      phoneNumber,
      amount,
      accountReference,
      description
    );
    
    // Log the response for debugging
    console.log("STK Push Response:", JSON.stringify(result));
    
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    
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
