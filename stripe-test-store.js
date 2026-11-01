const ENDPOINT='https://hwsavnkammbhgizltqrc.supabase.co/functions/v1/northstar-sandbox-checkout';
const status=document.getElementById('checkout-status');
const allowed=new Set(['focus','launch','creator','membership']);
for(const button of document.querySelectorAll('[data-sku]')){
  button.addEventListener('click',async event=>{
    event.preventDefault();
    const sku=button.dataset.sku;
    if(!allowed.has(sku)||button.getAttribute('aria-disabled')==='true')return;
    button.setAttribute('aria-disabled','true');
    button.textContent='Opening test checkout…';
    status.textContent='';
    try{
      const response=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sku})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Checkout unavailable');
      const destination=new URL(result.url);
      if(destination.protocol!=='https:'||!['checkout.stripe.com','billing.stripe.com'].includes(destination.hostname))throw new Error('Unexpected checkout destination');
      window.location.assign(destination.href);
    }catch(error){
      status.textContent='Could not open '+sku+' test checkout: '+error.message;
      button.removeAttribute('aria-disabled');
      button.textContent=sku==='membership'?'Test subscription checkout':'Open test checkout';
    }
  });
}
