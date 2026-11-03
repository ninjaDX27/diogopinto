import test from "node:test";
import assert from "node:assert/strict";
import {generate, evaluate, routeSyntheticEvent, validate, CAMPAIGNS, AS_OF} from "../src/pipeline.mjs";

const dataset=generate(2026);
test("seeded pipeline produces deterministic events and costs",()=>{
  assert.deepEqual(generate(2026), dataset);
  assert.notDeepEqual(generate(2027).leads.slice(0,10), dataset.leads.slice(0,10));
});
test("input grain, funnel and revenue validate",()=>{
  assert.equal(validate(dataset).length,0);
  assert(dataset.leads.length>150);
  assert.equal(dataset.daily.length,183*CAMPAIGNS.length);
  assert.equal(dataset.daily.reduce((n,d)=>n+d.leads,0),dataset.leads.length);
});
test("consent gates emit no analytics or advertising data without permission",()=>{
  const lead=dataset.leads[0];
  const route=routeSyntheticEvent({...lead,consent:{analytics:false,advertising:false}});
  assert.equal(route.analytics,null);
  assert.equal(route.ads,null);
  assert(route.crm);
  assert(!JSON.stringify(route).includes("loan_amount"));
});
test("90 day matured cohort excludes recent leads and acquisition costs",()=>{
  const mature=evaluate(dataset,{asOf:AS_OF,matureOnly:true});
  const all=evaluate(dataset,{asOf:AS_OF,matureOnly:false});
  assert(mature.kpis.received<all.kpis.received);
  assert(mature.kpis.media_cost<all.kpis.media_cost);
  assert(mature.quality.immature_excluded>0);
  assert(all.kpis.signed>=mature.kpis.signed);
});
test("campaign and aggregate commission reconcile on exact cents",()=>{
  const x=evaluate(dataset);
  assert(Math.abs(x.kpis.commission-x.by_campaign.reduce((n,c)=>n+c.commission,0))<.02);
  assert(Math.abs(x.kpis.media_cost-x.by_campaign.reduce((n,c)=>n+c.spend,0))<.02);
  assert.equal(x.by_campaign.reduce((n,c)=>n+c.leads,0),x.kpis.received);
});
test("stage funnel is monotonic and signatures are observed as of cutoff",()=>{
  for (const matureOnly of [true,false]) {
    const k=evaluate(dataset,{matureOnly}).kpis;
    assert(k.received>=k.contacted && k.contacted>=k.qualified &&
       k.qualified>=k.documented && k.documented>=k.approved && k.approved>=k.signed);
  }
});
test("filters isolate channels and retain non-paying organic spend",()=>{
  const paid=evaluate(dataset,{channel:"Google Search"});
  const seo=evaluate(dataset,{channel:"Organic Search"});
  assert.equal(paid.by_campaign.length,2);
  assert.equal(seo.by_campaign.length,1);
  assert.equal(seo.kpis.media_cost,0);
  assert.equal(seo.kpis.media_cost_per_contract,null);
});
test("invalid reporting horizon is rejected",()=>{
  assert.throws(()=>evaluate(dataset,{asOf:"2027-10-01"}),/asOf/);
});
