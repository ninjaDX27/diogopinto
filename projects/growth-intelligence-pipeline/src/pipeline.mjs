/**
 * Growth Intelligence Pipeline — deterministic, synthetic CRM / acquisition data.
 * No network calls, API credentials, third-party data, identities or production integration.
 */
export const AS_OF = "2026-11-01";
export const START = "2026-04-01";
export const END = "2026-09-30";
export const MATURITY_DAYS = 90;
export const CAMPAIGNS = Object.freeze([
  { id:"search-home", name:"Search · Mortgage", channel:"Google Search", product:"Mortgage", budget:29, quality:0.46 },
  { id:"search-transfer", name:"Search · Transfer", channel:"Google Search", product:"Transfer", budget:24, quality:0.48 },
  { id:"meta-prospect", name:"Meta · Prospecting", channel:"Meta Ads", product:"Mortgage", budget:18, quality:0.29 },
  { id:"organic-guides", name:"SEO · Guides", channel:"Organic Search", product:"Mortgage", budget:0, quality:0.49 }
]);

const msDay = 86400000;
const toMs = (iso) => Date.parse(iso + "T00:00:00Z");
const toIso = (ms) => new Date(ms).toISOString().slice(0,10);
const round = (n) => Math.round(n * 100) / 100;
function rng(seed) {
  let state = seed >>> 0;
  return () => { state = (state + 0x6D2B79F5) | 0; let t = Math.imul(state ^ state >>> 15, 1 | state); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function randomBetween(random, low, high) { return low + Math.floor(random() * (high - low + 1)); }
const daysApart = (earlier, later) => Math.floor((toMs(later) - toMs(earlier)) / msDay);

export function generate(seed = 2026) {
  if (!Number.isSafeInteger(seed)) throw new TypeError("seed must be an integer");
  const random = rng(seed), daily = [], leads = [], events = [];
  let serial = 0;
  for (let stamp = toMs(START); stamp <= toMs(END); stamp += msDay) {
    const day = toIso(stamp);
    for (const campaign of CAMPAIGNS) {
      const impressions = randomBetween(random, 500, 1500);
      const clicks = randomBetween(random, 26, 66);
      const propensity = campaign.channel === "Meta Ads" ? 0.040 : campaign.channel === "Organic Search" ? 0.043 : 0.035;
      const leadCount = Math.min(clicks, Math.max(0, Math.round(clicks * propensity + (random() - 0.5) * 2.6)));
      const cost = campaign.budget ? round(campaign.budget * (0.83 + random() * 0.35)) : 0;
      daily.push({ date: day, campaign_id:campaign.id, channel:campaign.channel,
        impressions, clicks, leads:leadCount, media_cost:cost });
      for (let i = 0; i < leadCount; i++) {
        serial++;
        const leadId = "SYN-L" + String(serial).padStart(6,"0");
        const consent = { analytics:random() > 0.22, advertising:random() > 0.34 };
        const contacted = random() < 0.89;
        const qualified = contacted && random() < campaign.quality;
        const documented = qualified && random() < 0.39;
        const approved = documented && random() < 0.61;
        const signed = approved && random() < 0.72;
        const loanAmount = campaign.product === "Transfer"
          ? randomBetween(random, 85000, 165000) : randomBetween(random, 95000, 205000);
        let stateTime = stamp;
        const stages = { received:day };
        for (const [name, achieved, low, high] of [
          ["contacted", contacted, 0, 2], ["qualified", qualified, 2, 6],
          ["documented", documented, 6, 20], ["approved", approved, 17, 29],
          ["signed", signed, 15, 29]
        ]) {
          if (!achieved) break;
          stateTime += randomBetween(random,low,high) * msDay;
          stages[name] = toIso(stateTime);
        }
        const record = { lead_id:leadId, event_id:"SYN-EVT-" + String(serial).padStart(6,"0"),
          received_at:day, campaign_id:campaign.id, channel:campaign.channel,
          product:campaign.product, stages, consent, loan_amount:loanAmount,
          commission_amount: stages.signed ? round(loanAmount * 0.0065) : 0 };
        leads.push(record);
        // Simulated routing only: analytics and ads destinations are absent without consent.
        // Never include loan_amount, contact details, identity or PII in event payloads.
        const routed = routeSyntheticEvent(record);
        events.push(routed);
      }
    }
  }
  return { metadata:{type:"synthetic", seed, start:START, end:END, as_of:AS_OF,
     maturity_days:MATURITY_DAYS, currency:"EUR", retained_commission_assumption:0.0065,
     source_repositories:[
       "https://github.com/ninjaDX27/martech-tracking-architecture",
       "https://github.com/ninjaDX27/analytics-dashboards"
     ]}, campaigns:CAMPAIGNS.map(c => ({...c})), daily, leads, events };
}

export function routeSyntheticEvent(lead) {
  return {
    event_id:lead.event_id,
    crm: { lead_id:lead.lead_id, campaign_id:lead.campaign_id, received_at:lead.received_at },
    analytics: lead.consent.analytics ? { name:"generate_lead", event_id:lead.event_id,
      campaign_id:lead.campaign_id } : null,
    ads: lead.consent.advertising ? { name:"Lead", event_id:lead.event_id,
      campaign_id:lead.campaign_id } : null
  };
}

function reached(stage, asOf) { return !!stage && stage <= asOf; }
export function evaluate(dataset, {asOf=AS_OF, channel="all", matureOnly=true}={}) {
  if (asOf < START || asOf > AS_OF) throw new RangeError("asOf outside simulation time");
  const campaigns = dataset.campaigns.filter(c => channel === "all" || c.channel === channel);
  const keep = new Set(campaigns.map(c => c.id));
  const cutoffMs = toMs(asOf) - MATURITY_DAYS * msDay;
  const inScope = date => toMs(date) <= toMs(asOf) && (!matureOnly || toMs(date) <= cutoffMs);
  const sourceDaily = dataset.daily.filter(d => keep.has(d.campaign_id) && inScope(d.date));
  const sourceLeads = dataset.leads.filter(l => keep.has(l.campaign_id) && inScope(l.received_at));
  const counts = Object.fromEntries(["received","contacted","qualified","documented","approved","signed"].map(x=>[x,0]));
  let commission = 0;
  for(const l of sourceLeads) {
    for (const key of Object.keys(counts)) if (reached(l.stages[key],asOf)) counts[key]++;
    if (reached(l.stages.signed,asOf)) commission += l.commission_amount;
  }
  const media = round(sourceDaily.reduce((n,d)=>n+d.media_cost,0));
  const companyCommission = round(commission);
  const byCampaign = campaigns.map(c=>{
    const facts = sourceDaily.filter(d=>d.campaign_id===c.id);
    const cohort = sourceLeads.filter(l=>l.campaign_id===c.id);
    const spend = round(facts.reduce((n,d)=>n+d.media_cost,0));
    const qualified = cohort.filter(l=>reached(l.stages.qualified,asOf)).length;
    const signed = cohort.filter(l=>reached(l.stages.signed,asOf));
    const revenue = round(signed.reduce((n,l)=>n+l.commission_amount,0));
    return {id:c.id, name:c.name, channel:c.channel, leads:cohort.length, qualified,
      signed:signed.length, spend, commission:revenue,
      cost_per_qualified:spend && qualified ? round(spend/qualified):null,
      media_cost_per_contract:spend && signed.length ? round(spend/signed.length):null,
      commission_to_media_spend:spend ? round(revenue/spend):null };
  });
  const byMonth = [...new Set(sourceDaily.map(d=>d.date.slice(0,7)))].sort().map(month=>{
    const facts = sourceDaily.filter(d=>d.date.startsWith(month));
    const cohort = sourceLeads.filter(l=>l.received_at.startsWith(month));
    const signed = cohort.filter(l=>reached(l.stages.signed,asOf));
    return {month, leads:cohort.length, qualified:cohort.filter(l=>reached(l.stages.qualified,asOf)).length,
      signed:signed.length, media_cost:round(facts.reduce((n,d)=>n+d.media_cost,0)),
      commission:round(signed.reduce((n,l)=>n+l.commission_amount,0))};
  });
  const tracking = {total:sourceLeads.length,
    analytics_eligible:sourceLeads.filter(l=>l.consent.analytics).length,
    ads_eligible:sourceLeads.filter(l=>l.consent.advertising).length};
  const quality = {non_attributed:sourceLeads.filter(l=>!l.campaign_id).length,
    repeated_ids:sourceLeads.length - new Set(sourceLeads.map(l=>l.lead_id)).size,
    immature_excluded: matureOnly ? dataset.leads.filter(l=>keep.has(l.campaign_id) && toMs(l.received_at)<=toMs(asOf) && toMs(l.received_at)>cutoffMs).length:0};
  const kpis={...counts,media_cost:media,commission:companyCommission,
    media_cost_per_contract:counts.signed&&media?round(media/counts.signed):null,
    commission_to_media_spend:media?round(commission/media):null,
    qualified_rate:counts.received?round(100*counts.qualified/counts.received):0,
    lead_to_contract_rate:counts.received?round(100*counts.signed/counts.received):0};
  return { as_of:asOf, channel, mature_only:matureOnly, kpis, by_campaign:byCampaign,
    by_month:byMonth, tracking, quality,
    interpretation: matureOnly
     ? "Only 90-day matured lead cohorts and their acquisition spend; outcomes observed by as-of date."
     : "Includes recent lead cohorts not yet fully observable. Avoid comparing conversion rates with matured cohorts."};
}

export function validate(dataset) {
  const issues=[], keySet=new Set();
  const dailySum=new Map();
  for (const fact of dataset.daily) {
    const key=fact.date+"|"+fact.campaign_id;
    if (dailySum.has(key)) issues.push("Duplicate daily grain: "+key);
    if (fact.impressions < fact.clicks || fact.clicks < fact.leads || fact.media_cost < 0)
      issues.push("Invalid daily funnel or cost: "+key);
    dailySum.set(key,fact.leads);
  }
  const actualCount = new Map();
  for (const lead of dataset.leads) {
    if (keySet.has(lead.lead_id)) issues.push("Duplicate lead: "+lead.lead_id);
    keySet.add(lead.lead_id);
    const key=lead.received_at+"|"+lead.campaign_id;
    actualCount.set(key,(actualCount.get(key)||0)+1);
    if (lead.stages.signed && !lead.stages.approved) issues.push("Signed without approval");
    if (lead.stages.approved && !lead.stages.documented) issues.push("Approved without documents");
    if (!lead.stages.signed && lead.commission_amount) issues.push("Unsigned revenue");
    const dates=Object.values(lead.stages);
    if (dates.some((d,i)=>i>0&&d<dates[i-1])) issues.push("Stage order violated");
    if (JSON.stringify(lead).match(/@|hashed_email|hashed_phone|telephone|full_name/i))
      issues.push("Unexpected identity field");
  }
  for(const [key,count] of dailySum) if((actualCount.get(key)||0)!==count) issues.push("Daily / lead reconciliation: "+key);
  if (dataset.events.length !== dataset.leads.length) issues.push("Events count mismatch");
  for(let i=0;i<dataset.leads.length;i++){
    const lead=dataset.leads[i],event=dataset.events[i];
    if ((!lead.consent.analytics&&event.analytics)||(!lead.consent.advertising&&event.ads))
      issues.push("Consent gate failed: "+lead.lead_id);
    if (Object.keys(event.crm).some(k=>/email|phone|loan|commission/i.test(k)))
      issues.push("Sensitive field in demo CRM route");
  }
  return issues;
}
