// Northstar sandbox Checkout client. No browser-side secret keys.
// Use only on the sandbox store; never treat a success redirect as payment proof.
export const CHECKOUT_ENDPOINT='https://hwsavnkammbhgizltqrc.supabase.co/functions/v1/northstar-sandbox-checkout';
const VALID_SKUS=new Set(['focus','launch','creator','membership']);
export async function startSandboxCheckout(sku){
  if(!VALID_SKUS.has(sku))throw new Error('Unknown product');
  const response=await fetch(CHECKOUT_ENDPOINT,{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({sku})
  });
  let result;
  try{result=await response.json()}catch{throw new Error('Checkout service returned an invalid response')}
  if(!response.ok||typeof result.url!=='string')throw new Error(result.error||'Checkout is unavailable');
  const destination=new URL(result.url);
  if(destination.protocol!=='https:'||!(['checkout.stripe.com','billing.stripe.com'].includes(destination.hostname))){
    throw new Error('Unexpected checkout destination');
  }
  window.location.assign(destination.href);
}
