import {mkdir, readFile, writeFile} from "node:fs/promises";
import {generate, validate, evaluate, AS_OF} from "../src/pipeline.mjs";
const dataset=generate(2026);
const problems=validate(dataset);
if (problems.length) throw new Error(problems.join("\n"));
const summary=evaluate(dataset,{asOf:AS_OF,matureOnly:true});
const template=await readFile(new URL("../demo/template.html",import.meta.url),"utf8");
if (!template.includes("<!--SYNTHETIC_DATA-->")) throw new Error("Demo template placeholder missing");
const channels=["all", ...new Set(dataset.campaigns.map(c=>c.channel))];
const snapshots=Object.fromEntries(channels.map(channel=>[
  channel, {
    mature:evaluate(dataset,{asOf:AS_OF,channel,matureOnly:true}),
    all:evaluate(dataset,{asOf:AS_OF,channel,matureOnly:false})
  }
]));
const example=dataset.leads.find(l=>l.stages.signed&&l.stages.signed<=AS_OF)||dataset.leads[0];
const sample={lead_id:example.lead_id,event_id:example.event_id,campaign_id:example.campaign_id};
const presentation={metadata:dataset.metadata,snapshots,sample};
const embedded=JSON.stringify(presentation).replace(/</g,"\\u003c");
const html=template.replace("<!--SYNTHETIC_DATA-->",
  '<script type="application/json" id="pipeline-data">'+embedded+'</script>');
await mkdir(new URL("../dist/growth/",import.meta.url),{recursive:true});
await writeFile(new URL("../dist/growth/index.html",import.meta.url),html,"utf8");
await mkdir(new URL("../dist/growth/data/",import.meta.url),{recursive:true});
const serialize=(value)=>{
  const text=value===null||value===undefined?"":String(value);
  return /[",\r\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;
};
async function exportCsv(name,rows,fields){
  const content=[fields.join(","),...rows.map(row=>fields.map(field=>serialize(row[field])).join(","))].join("\n")+"\n";
  await writeFile(new URL("../dist/growth/data/"+name,import.meta.url),content,"utf8");
}
await exportCsv("campaign_daily.csv",dataset.daily,
  ["date","campaign_id","channel","impressions","clicks","leads","media_cost"]);
const lifecycle=dataset.leads.map(l=>{
  const observed=(stage)=>l.stages[stage] && l.stages[stage] <= AS_OF ? l.stages[stage] : "";
  return {
    lead_id:l.lead_id,event_id:l.event_id,received_at:l.received_at,
    campaign_id:l.campaign_id,channel:l.channel,product:l.product,
    contacted_at:observed("contacted"),qualified_at:observed("qualified"),
    documented_at:observed("documented"),approved_at:observed("approved"),
    signed_at:observed("signed"),loan_amount:l.loan_amount,
    commission_amount:observed("signed") ? l.commission_amount : 0,
    analytics_allowed:l.consent.analytics,advertising_allowed:l.consent.advertising
  };
});
await exportCsv("lead_lifecycle.csv",lifecycle,
  ["lead_id","event_id","received_at","campaign_id","channel","product",
   "contacted_at","qualified_at","documented_at","approved_at","signed_at",
   "loan_amount","commission_amount","analytics_allowed","advertising_allowed"]);
await exportCsv("campaign_cohort_metrics.csv",summary.by_campaign,
  ["id","name","channel","leads","qualified","signed","spend","commission",
   "cost_per_qualified","media_cost_per_contract","commission_to_media_spend"]);
await exportCsv("monthly_cohorts.csv",summary.by_month,
  ["month","leads","qualified","signed","media_cost","commission"]);
await writeFile(new URL("../dist/growth/summary.json",import.meta.url),
  JSON.stringify({source:"synthetic",summary},null,2),"utf8");
console.log(JSON.stringify({status:"ok",records:dataset.leads.length,cohorts:summary.by_month.length,
  synthetic:true,html_bytes:Buffer.byteLength(html)},null,2));
