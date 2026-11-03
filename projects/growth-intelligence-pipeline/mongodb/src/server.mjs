/**
 * MongoDB Atlas-backed API scaffold for local development.
 * No PII, no banking records, no advertising or analytics network requests.
 * Never expose this DEV_API_TOKEN server on the public internet.
 */
import http from "node:http";
import {randomUUID,timingSafeEqual} from "node:crypto";
import {getDatabase,closeDatabase} from "./db.mjs";
import {canMove,safeProjection,validateCreate,validateStatus,STAGES} from "./model.mjs";

if(process.env.NODE_ENV==="production")throw new Error("Demo API cannot run in production");
const token=process.env.DEV_API_TOKEN;
if(typeof token!=="string"||token.length<32||token.startsWith("REPLACE_"))
  throw new Error("DEV_API_TOKEN must be a strong random string of 32+ characters");
const host=process.env.BIND_HOST||"127.0.0.1";
if(!["127.0.0.1","::1","localhost"].includes(host))
  throw new Error("The demo API only binds to localhost");
const port=Number(process.env.PORT||8787);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error("Invalid PORT");

const json=(res,status,payload)=>{
  const body=JSON.stringify(payload);
  res.writeHead(status,{
    "Content-Type":"application/json; charset=utf-8","Content-Length":Buffer.byteLength(body),
    "Cache-Control":"no-store","X-Content-Type-Options":"nosniff",
    "Referrer-Policy":"no-referrer"
  });res.end(body);
};
async function readJson(req){
  let length=0,body="";
  for await(const chunk of req){
    length+=chunk.length;
    if(length>16384){const e=new Error("Body too large");e.status=413;throw e;}
    body+=chunk.toString("utf8");
  }
  try{return JSON.parse(body)}catch{const e=new Error("Invalid JSON");e.status=400;throw e;}
}
function isAuthorized(req){
  const header=req.headers.authorization||"";
  if(!header.startsWith("Bearer "))return false;
  const given=Buffer.from(header.slice(7));
  const expected=Buffer.from(token);
  return given.length===expected.length&&timingSafeEqual(given,expected);
}
const tenantId="synthetic-demo";
async function handler(req,res){
  try{
    const pathname=new URL(req.url,"http://localhost").pathname;
    if(req.method==="GET"&&pathname==="/health")return json(res,200,{status:"ok",mode:"local-demo"});
    if(!isAuthorized(req))return json(res,401,{error:"Unauthorized"});
    const db=await getDatabase(), leads=db.collection("crm_leads");
    if(req.method==="POST"&&pathname==="/v1/leads"){
      let data;try{data=validateCreate(await readJson(req));}
      catch(e){return json(res,e.status||400,{error:e.message})}
      const now=new Date();
      const value={
        tenantId,leadId:randomUUID(),...data,status:"new",
        createdAt:now,updatedAt:now,history:[{eventId:data.eventId,status:"new",at:now}]
      };
      await leads.updateOne({tenantId,eventId:data.eventId},{$setOnInsert:value},{upsert:true});
      const saved=await leads.findOne({tenantId,eventId:data.eventId});
      return json(res,200,{lead:safeProjection(saved),idempotent:true});
    }
    const match=pathname.match(/^\/v1\/leads\/([0-9a-f-]{36})\/status$/);
    if(req.method==="PATCH"&&match){
      let data;try{data=validateStatus(await readJson(req))}
      catch(e){return json(res,e.status||400,{error:e.message})}
      const existing=await leads.findOne({tenantId,leadId:match[1]});
      if(!existing)return json(res,404,{error:"Lead not found"});
      if(existing.history.some(x=>x.eventId===data.eventId))
        return json(res,200,{lead:safeProjection(existing),duplicateEvent:true});
      if(!canMove(existing.status,data.status))
        return json(res,409,{error:"Invalid stage transition",from:existing.status,to:data.status});
      const now=new Date();
      const result=await leads.updateOne({tenantId,leadId:match[1],status:existing.status,
        "history.eventId":{$ne:data.eventId}},
        {$set:{status:data.status,updatedAt:now},
         $push:{history:{eventId:data.eventId,status:data.status,at:now}}});
      if(result.modifiedCount!==1)return json(res,409,{error:"Concurrent or duplicate update"});
      const updated=await leads.findOne({tenantId,leadId:match[1]});
      return json(res,200,{lead:safeProjection(updated)});
    }
    if(req.method==="GET"&&pathname==="/v1/leads"){
      const latest=await leads.find({tenantId},{projection:{_id:0,leadId:1,campaignId:1,
        source:1,product:1,status:1,createdAt:1,updatedAt:1}})
        .sort({createdAt:-1}).limit(50).toArray();
      return json(res,200,{mode:"synthetic-demo",items:latest});
    }
    if(req.method==="GET"&&pathname==="/v1/metrics"){
      const agg=await leads.aggregate([
        {$match:{tenantId}},
        {$group:{_id:{campaignId:"$campaignId",status:"$status"},leads:{$sum:1}}},
        {$sort:{"_id.campaignId":1,"_id.status":1}}
      ]).toArray();
      const total=await leads.countDocuments({tenantId});
      const signed=await leads.countDocuments({tenantId,status:"signed"});
      return json(res,200,{mode:"synthetic-demo",total,signed,
        contractRate:total?signed/total:null,byCampaignAndStatus:agg.map(r=>({
          campaignId:r._id.campaignId,status:r._id.status,count:r.leads}))});
    }
    return json(res,404,{error:"Not found"});
  }catch(e){
    console.error("Request failed:",e.name); // No credentials, PII or request body in logs
    return json(res,500,{error:"Internal error"});
  }
}
const server=http.createServer(handler);
server.listen(port,host,()=>console.log("DEMO MongoDB API on http://"+host+":"+port));
for(const signal of ["SIGINT","SIGTERM"])process.on(signal,()=>{
  server.close(()=>closeDatabase().finally(()=>process.exit(0)));
});
