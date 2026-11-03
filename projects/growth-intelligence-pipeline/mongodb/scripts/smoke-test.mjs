/**
 * End-to-end localhost smoke test against explicitly configured MongoDB _dev.
 * Synthetic identifiers only. Requires separately running local API.
 * NODE 22+: node --env-file=.env scripts/smoke-test.mjs
 */
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";

const token=process.env.DEV_API_TOKEN;
if(!token || token.length<32 || token.startsWith("REPLACE_")){
  console.error("Configure DEV_API_TOKEN in .env first.");
  process.exit(1);
}
const port=Number(process.env.PORT||8787);
const base="http://127.0.0.1:"+port;
const jsonHeaders={"Authorization":"Bearer "+token,"Content-Type":"application/json"};
async function request(method,path,body,authenticated=true){
  const response=await fetch(base+path,{
    method,
    headers:authenticated?jsonHeaders:{},
    body:body===undefined?undefined:JSON.stringify(body),
    signal:AbortSignal.timeout(12000)
  });
  let data;
  try{data=await response.json()}catch{data={error:"Non-JSON server response"}}
  if(!response.ok){
    throw new Error(method+" "+path+": HTTP "+response.status+" ("+(data.error||"unknown error")+")");
  }
  return data;
}

try{
  const health=await request("GET","/health",undefined,false);
  assert.equal(health.mode,"local-demo");

  const id=randomUUID();
  const create={eventId:"demo-"+id,campaignId:"search-home",source:"website",product:"mortgage"};
  const first=await request("POST","/v1/leads",create);
  assert.equal(first.lead.status,"new");
  const leadId=first.lead.leadId;
  const repeat=await request("POST","/v1/leads",create);
  assert.equal(repeat.lead.leadId,leadId,"Duplicate create must reuse existing lead");

  const contact=await request("PATCH","/v1/leads/"+leadId+"/status",{
    eventId:"contact-"+id,status:"contacted"
  });
  assert.equal(contact.lead.status,"contacted");

  const qualified=await request("PATCH","/v1/leads/"+leadId+"/status",{
    eventId:"qual-"+id,status:"qualified"
  });
  assert.equal(qualified.lead.status,"qualified");

  const list=await request("GET","/v1/leads");
  assert(list.items.some(x=>x.leadId===leadId),"Created lead missing from latest 50");
  const metrics=await request("GET","/v1/metrics");
  assert(metrics.total>=1);
  assert(metrics.byCampaignAndStatus.some(x=>x.campaignId==="search-home"&&x.status==="qualified"));

  console.log(JSON.stringify({
    result:"PASS",mode:"LOCAL_DEVELOPMENT_SYNTHETIC_ONLY",
    health:health.status,leadId,
    idempotentCreate:true,finalStatus:qualified.lead.status,
    metricsTotal:metrics.total,metricsSigned:metrics.signed,
    checked:["API health","MongoDB create","idempotency","CRM transitions","list endpoint","aggregated metrics"]
  },null,2));
} catch(error){
  console.error("SMOKE TEST FAILED:",error.message);
  console.error("Check local API terminal, .env, Atlas database user and current IP access.");
  process.exitCode=1;
}
