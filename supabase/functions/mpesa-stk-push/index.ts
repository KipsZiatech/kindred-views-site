import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
}

interface STKPushRequest {
  phone: string
  amount: number
  packageId?: string
  accountReference: string
  loanAmount?: string
  customerName?: string
}

serve(async (req) => {
  console.log('MPesa STK Push function started - method:', req.method, 'url:', req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('STK Push function called with method:', req.method)
    const { phone, amount, packageId, accountReference, loanAmount, customerName }: STKPushRequest = await req.json()

    console.log('STK Push request received:', { phone, amount, packageId, accountReference })

    // Validate required fields
    if (!phone || !amount) {
      console.log('Validation failed: missing phone or amount')
      return new Response(
        JSON.stringify({ success: false, message: 'Phone number and amount are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get M-Pesa credentials from environment
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const passkey = Deno.env.get('MPESA_PASSKEY')

    console.log('Checking M-Pesa credentials:', {
      hasConsumerKey: !!consumerKey,
      hasConsumerSecret: !!consumerSecret,
      hasPasskey: !!passkey,
      consumerKeyLength: consumerKey?.length,
      consumerSecretLength: consumerSecret?.length,
      passkeyLength: passkey?.length
    })

    if (!consumerKey || !consumerSecret || !passkey) {
      console.error('Missing M-Pesa credentials:', {
        consumerKey: consumerKey ? 'present' : 'missing',
        consumerSecret: consumerSecret ? 'present' : 'missing',
        passkey: passkey ? 'present' : 'missing'
      })
      return new Response(
        JSON.stringify({ success: false, message: 'M-Pesa credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const businessShortCode = '4139425'
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').substring(0, 14)
    const password = btoa(`${businessShortCode}${passkey}${timestamp}`)

    console.log('Generated timestamp:', timestamp)
    console.log('Using business short code:', businessShortCode)
    console.log('Password generated successfully')

    // Step 1: Get OAuth token
    const authUrl = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    const authCredentials = btoa(`${consumerKey}:${consumerSecret}`)

    console.log('Requesting OAuth token from:', authUrl)
    console.log('Auth credentials length:', authCredentials.length)

    const authResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authCredentials}`,
        'Content-Type': 'application/json'
      }
    })

    if (!authResponse.ok) {
      console.error('Auth failed:', await authResponse.text())
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to authenticate with M-Pesa' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const authData = await authResponse.json()
    const accessToken = authData.access_token

    console.log('OAuth token obtained successfully')

    // Step 2: Initiate STK Push
    const stkPushUrl = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    const callbackUrl = 'https://xxfybuqajtejzthyszam.supabase.co/functions/v1/mpesa-callback'
    
    // Till Number for payment collection
    const tillNumber = '6965624'

    const stkPushData = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline', // Changed to Till Number transaction
      Amount: Math.round(amount), // Ensure amount is an integer
      PartyA: phone,
      PartyB: tillNumber, // Collect to Till Number
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || 'Loan Payment',
      TransactionDesc: loanAmount ? `Loan Payment - Ksh ${loanAmount}` : 'Savings & Processing Fee'
    }

    console.log('STK Push payload:', { ...stkPushData, Password: '[HIDDEN]' })

    const stkResponse = await fetch(stkPushUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPushData)
    })

    const stkData = await stkResponse.json()
    console.log('STK Push response:', stkData)

    if (stkData.ResponseCode === '0') {
      // Create a Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Store the STK push request for tracking (anonymous)
      const { error: insertError } = await supabase
        .from('mpesa_payments')
        .insert({
          checkout_request_id: stkData.CheckoutRequestID,
          amount: amount,
          paybill_number: businessShortCode,
          account_name: 'Shwari M-Pesa',
          package_id: packageId,
          mpesa_message: `STK Push initiated for ${phone} - Amount: ${amount}`,
          payment_date: new Date().toISOString(),
          payment_status: 'PENDING',
          phone_number: phone,
          customer_name: customerName || 'Unknown'
        })

      if (insertError) {
        console.error('Failed to store STK push record:', insertError)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'STK Push sent successfully. Please check your phone.',
          checkoutRequestId: stkData.CheckoutRequestID
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: stkData.errorMessage || 'STK Push failed',
          details: stkData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

  } catch (error) {
    console.error('STK Push error:', error)
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    })
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', error: error?.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})