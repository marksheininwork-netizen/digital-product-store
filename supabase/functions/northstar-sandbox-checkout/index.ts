// Sandbox-only checkout endpoint for Supabase Edge Functions.
// Set STRIPE_SECRET_KEY=sk_test_... and STRIPE_PRICE_* as Edge Function secrets.
const allowedOrigins = ['https://northstar.atlaspointdigital.com','https://marksheininwork-netizen.github.io'];
const prices = {focus:'STRIPE_PRICE_FOCUS',launch:'STRIPE_PRICE_LAUNCH',creator:'STRIPE_PRICE_CREATOR',membership:'STRIPE_PRICE_MEMBERSHIP'};
Deno.serve(async req => {
  const origin=req.headers.get('origin')||'';
  const cors={'access-control-allow-origin':allowedOrigins.includes(origin)?origin:allowedOrigins[0],
    'access-control-allow-methods':'POST,OPTIONS','access-control-allow-headers':'content-type,apikey,authorization',
    'vary':'Origin','cache-control':'no-store'};
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,'content-type':'application/json'}});
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST')return reply({error:'Method not allowed'},405);
  if(!allowedOrigins.includes(origin))return reply({error:'Origin not allowed'},403);
  const key=Deno.env.get('STRIPE_SECRET_KEY')||'';
  if(!key.startsWith('sk_test_'))return reply({error:'Sandbox is not configured'},503);
  let input;
  try{input=await req.json()}catch{return reply({error:'Invalid request'},400)}
  if(typeof input?.sku!=='string'||!(input.sku in prices))return reply({error:'Unknown product'},400);
  const price=Deno.env.get(prices[input.sku]);
  if(!price||!/^price_[a-zA-Z0-9]+$/.test(price))return reply({error:'Product is not configured'},503);
  const base='https://northstar.atlaspointdigital.com';
  const body=new URLSearchParams({
    mode:input.sku==='membership'?'subscription':'payment',
    'line_items[0][price]':price,
    'line_items[0][quantity]':'1',
    success_url:base+'/account.html?checkout=success&session_id={CHECKOUT_SESSION_ID}',
    cancel_url:base+'/?checkout=cancel',
    billing_address_collection:'auto',
    'automatic_tax[enabled]':'false'
  });
  try{
    const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{
      method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/x-www-form-urlencoded'},body
    });
    const data=await response.json();
    if(!response.ok||!data.url){console.error('Stripe checkout failed',response.status,data.error?.code);return reply({error:'Checkout unavailable'},502)}
    return reply({url:data.url});
  }catch{return reply({error:'Checkout unavailable'},502)}
});
