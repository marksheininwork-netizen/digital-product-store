import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto, createHmac} from 'node:crypto';
import {transform} from 'esbuild';

const secret='whsec_localfixture';
const env={NORTHSTAR_STRIPE_LIVE_SECRET_KEY:'rk_live_localfixture',NORTHSTAR_STRIPE_LIVE_WEBHOOK_SECRET:secret,SUPABASE_URL:'https://database.invalid',SUPABASE_SERVICE_ROLE_KEY:'localfixture',NORTHSTAR_LIVE_PRICE_EMAILS:'price_fixture'};
async function handler(name,fetcher,overrides={}){
  const source=await readFile(new URL(`../supabase/functions/${name}/index.ts`,import.meta.url),'utf8');
  const {code}=await transform(source,{loader:'ts',target:'es2022'});
  let run;
  vm.runInNewContext(code,{Deno:{env:{get:key=>({...env,...overrides})[key]},serve:fn=>{run=fn}},crypto:webcrypto,TextEncoder,Response,Request,URL,URLSearchParams,AbortSignal,fetch:fetcher,console:{error(){}}});
  return run;
}
function request(event,{age=0,signature=true}={}){
  const body=JSON.stringify(event),timestamp=Math.floor(Date.now()/1000)-age;
  const digest=createHmac('sha256',secret).update(`${timestamp}.${body}`).digest('hex');
  return new Request('https://webhook.invalid',{method:'POST',body,headers:signature?{'stripe-signature':`t=${timestamp},v1=${digest}`}:{}});
}
const event=(type='checkout.session.completed')=>({id:'evt_fixture',livemode:true,type,data:{object:{id:'cs_fixture',mode:'payment',payment_status:'paid'}}});
function fixtures({tax=0,refunded=false,disputed=false,badPrice=false,dbFailure=false}={}){
  const calls=[];
  const session={id:'cs_fixture',mode:'payment',status:'complete',livemode:true,payment_status:'paid',currency:'usd',amount_subtotal:900,amount_total:900+tax,total_details:{amount_tax:tax,amount_shipping:0,amount_discount:0},payment_intent:'pi_fixture',customer_details:{email:'buyer@example.invalid'}};
  const fetcher=async(url,options={})=>{
    if(url.includes('/rest/v1/rpc/')){calls.push({name:url.split('/').pop(),args:JSON.parse(options.body)});return Response.json(true,{status:dbFailure?500:200})}
    if(url.includes('/line_items'))return Response.json({has_more:false,data:[{quantity:1,amount_subtotal:900,price:{id:badPrice?'price_wrong':'price_fixture',unit_amount:900,currency:'usd',tax_behavior:'exclusive'}}]});
    if(url.includes('/payment_intents/'))return Response.json({livemode:true,status:'succeeded',currency:'usd',amount_received:900+tax,latest_charge:{refunded,disputed}});
    if(url.includes('/checkout/sessions/'))return Response.json(session);
    throw Error('Unexpected network call');
  };
  return {calls,fetcher};
}
for(const options of [{signature:false},{age:600}])test(`rejects invalid webhook authentication ${JSON.stringify(options)}`,async()=>{
  let calls=0;const run=await handler('northstar-live-webhook',()=>{calls++;throw Error('No network allowed')});
  assert.equal((await run(request(event(),options))).status,400);assert.equal(calls,0);
});
for(const tax of [0,80])test(`fulfills verified paid session with ${tax} cents of tax using a restricted key`,async()=>{
  const f=fixtures({tax}),run=await handler('northstar-live-webhook',f.fetcher);
  assert.equal((await run(request(event()))).status,200);assert.equal(f.calls.length,1);assert.equal(f.calls[0].args.p_amount,900+tax);assert.equal(f.calls[0].args.p_file,'email-swipe-file.txt');
});
for(const state of ['refunded','disputed'])test(`records ${state} before recording a delayed checkout`,async()=>{
  const f=fixtures({[state]:true}),run=await handler('northstar-live-webhook',f.fetcher);
  assert.equal((await run(request(event()))).status,200);assert.equal(f.calls[0].name,'northstar_record_live_payment_reversal');assert.equal(f.calls[0].args.p_status,state);assert.equal(f.calls[1].name,'northstar_record_live_paid_checkout');
});
test('rejects an unmapped price without granting access',async()=>{
  const f=fixtures({badPrice:true}),run=await handler('northstar-live-webhook',f.fetcher);
  assert.equal((await run(request(event()))).status,500);assert.equal(f.calls.length,0);
});
test('returns retryable failure when persistence fails',async()=>{
  const f=fixtures({dbFailure:true}),run=await handler('northstar-live-webhook',f.fetcher);
  assert.equal((await run(request(event()))).status,500);
});
test('unpaid completion never calls fulfillment',async()=>{
  const f=fixtures(),run=await handler('northstar-live-webhook',f.fetcher),e=event();e.data.object.payment_status='unpaid';
  assert.equal((await run(request(e))).status,200);assert.equal(f.calls.length,0);
});
test('signed test-mode events cannot enter live fulfillment',async()=>{
  const f=fixtures(),run=await handler('northstar-live-webhook',f.fetcher),e=event();e.livemode=false;
  assert.equal((await run(request(e))).status,400);assert.equal(f.calls.length,0);
});
test('sandbox API keys cannot configure the live handler',async()=>{
  const f=fixtures(),run=await handler('northstar-live-webhook',f.fetcher,{NORTHSTAR_STRIPE_LIVE_SECRET_KEY:'sk_test_fixture'});
  assert.equal((await run(request(event()))).status,503);assert.equal(f.calls.length,0);
});
test('source release lock prevents session creation even with environment enabled',async()=>{
  let calls=0;const run=await handler('northstar-live-checkout',()=>{calls++;throw Error('No Stripe call allowed')},{NORTHSTAR_LIVE_CHECKOUT_ENABLED:'true'});
  const response=await run(new Request('https://checkout.invalid',{method:'POST',headers:{origin:'https://northstar.atlaspointdigital.com','content-type':'application/json'},body:JSON.stringify({sku:'emails'})}));
  assert.equal(response.status,503);assert.equal(calls,0);
});
