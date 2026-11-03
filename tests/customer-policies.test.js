import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [pages,config,terms,privacy,refunds,license,contact] = await Promise.all([
  readFile(new URL('../pages.js',import.meta.url),'utf8'),
  readFile(new URL('../vite.config.js',import.meta.url),'utf8'),
  readFile(new URL('../terms.html',import.meta.url),'utf8'),
  readFile(new URL('../privacy.html',import.meta.url),'utf8'),
  readFile(new URL('../refunds.html',import.meta.url),'utf8'),
  readFile(new URL('../license.html',import.meta.url),'utf8'),
  readFile(new URL('../contact.html',import.meta.url),'utf8'),
]);

test('customer policy pages are included in the published site and linked from the footer',()=>{
  for(const name of ['terms','privacy','refunds','license']){
    assert.match(config,new RegExp(`['"]${name}['"]`));
    assert.match(pages,new RegExp(`${name}:\\(\\)=>`));
  }
  assert.match(pages,/\['products','tools'.*'privacy','terms','refunds','license'/);
  assert.match(terms,/data-page="terms"/);
  assert.match(privacy,/data-page="privacy"/);
  assert.match(refunds,/data-page="refunds"/);
  assert.match(license,/data-page="license"/);
  assert.match(contact,/data-page="contact"/);
});

test('published policy copy describes the current account and privacy flows accurately',()=>{
  assert.match(pages,/Supabase Auth processes your email address/);
  assert.match(pages,/Stripe processes payment details/);
  assert.match(pages,/QR generator sends the text or URL you enter to api\.qrserver\.com/);
  assert.match(pages,/Paid checkout is not currently available/);
  assert.match(pages,/does not currently run advertising or analytics tracking/);
});

test('refund and license terms are linked and include usable buyer protections',()=>{
  assert.match(pages,/14 calendar days/);
  assert.match(pages,/full refund/);
  assert.match(pages,/support contact shown on your Stripe payment receipt/);
  assert.match(pages,/share completed work product/);
  assert.match(pages,/may not sell, rent, sublicense, publish, or redistribute the source file/);
  assert.doesNotMatch(pages,/Add a recipient before sending/);
});

test('premium storefront route is published and membership avoids unverified seller claims',async()=>{
  const membership=await readFile(new URL('../membership.html',import.meta.url),'utf8');
  assert.match(config,/const pages = \[[^\]]*'shop'/);
  assert.match(membership,/Seller identity and required disclosures are being confirmed/);
  assert.doesNotMatch(membership,/Seller: (?:Maria Sheinin|Alexander Tsudikman)/);
});
