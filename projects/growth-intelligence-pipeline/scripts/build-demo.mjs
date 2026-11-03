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
await writeFile(new URL("../dist/growth/summary.json",import.meta.url),
  JSON.stringify({source:"synthetic",summary},null,2),"utf8");
console.log(JSON.stringify({status:"ok",records:dataset.leads.length,cohorts:summary.by_month.length,
  synthetic:true,html_bytes:Buffer.byteLength(html)},null,2));
