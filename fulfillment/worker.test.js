import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import worker from './worker.js';
if (!globalThis.crypto) globalThis.crypto=webcrypto;
const secret='whsec_test_signing_key';
const env={STRIPE_SECRET_KEY:'sk_test_placeholder',STRIPE_WEBHOOK_SECRET:secret,DOWNLOADS:{get:async(name)=>name==='email-swipe-file.txt'?{body:'TEST PREMIUM CONTENT'}:null}};
const sessionId='cs_test_123456789';
const price='price_1UWRdGAfTAEIufppLb4bkU7K';
const originalFetch=globalThis.fetch;
function stripeMock({paid=true,items=[price]}={}){globalThis.fetch=async(url,options)=>{assert.match(options.headers.authorization,/Bearer sk_test_placeholder/);const u=new URL(url);if(u.pathname.endsWith('/line_items'))return new Response(JSON.stringify({data:items.map(id=>({price:{id}}))}),{status:200});return new Response(JSON.stringify({id:sessionId,livemode:false,mode:'payment',payment_status:paid?'paid':'unpaid'}),{status:200})}}
test.afterEach(()=>{globalThis.fetch=originalFetch});
const call=(path,method='GET',headers={},body)=>worker.fetch(new Request('https://example.workers.dev'+path,{method,headers,body}),env);
async function signature(body,t=Math.floor(Date.now()/1000)){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const mac=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(t+'.'+body)));return 't='+t+',v1='+Array.from(mac,x=>x.toString(16).padStart(2,'0')).join('')}
test('health reports test-only mode',async()=>{const r=await call('/health');assert.equal(r.status,200);assert.equal((await r.json()).mode,'test')});
test('rejects malformed session IDs',async()=>{const r=await call('/purchases?session_id=bad');assert.equal(r.status,400)});
test('rejects unpaid checkout',async()=>{stripeMock({paid:false});const r=await call('/purchases?session_id='+sessionId);assert.equal(r.status,403)});
test('lists only purchased items',async()=>{stripeMock();const r=await call('/purchases?session_id='+sessionId);assert.equal(r.status,200);const j=await r.json();assert.equal(j.products.length,1);assert.equal(j.products[0].filename,'email-swipe-file.txt')});
test('rejects a different file',async()=>{stripeMock();const r=await call('/download?session_id='+sessionId+'&file=niche-template-bundle.zip');assert.equal(r.status,403)});
test('downloads a verified purchased file',async()=>{stripeMock();const r=await call('/download?session_id='+sessionId+'&file=email-swipe-file.txt');assert.equal(r.status,200);assert.equal(await r.text(),'TEST PREMIUM CONTENT')});
test('rejects unsigned webhooks',async()=>{const r=await call('/stripe-webhook','POST',{'content-type':'application/json'},JSON.stringify({type:'checkout.session.completed'}));assert.equal(r.status,400)});
test('accepts valid signed test event',async()=>{stripeMock();const body=JSON.stringify({livemode:false,type:'checkout.session.completed',data:{object:{id:sessionId,payment_status:'paid'}}});const r=await call('/stripe-webhook','POST',{'stripe-signature':await signature(body)},body);assert.equal(r.status,200)});
test('rejects stale webhook signatures',async()=>{const body=JSON.stringify({type:'checkout.session.completed'});const r=await call('/stripe-webhook','POST',{'stripe-signature':await signature(body,Math.floor(Date.now()/1000)-900)},body);assert.equal(r.status,400)});
test('rejects webhook when Stripe checkout is unpaid',async()=>{stripeMock({paid:false});const body=JSON.stringify({livemode:false,type:'checkout.session.completed',data:{object:{id:sessionId,payment_status:'paid'}}});const r=await call('/stripe-webhook','POST',{'stripe-signature':await signature(body)},body);assert.equal(r.status,403)});
