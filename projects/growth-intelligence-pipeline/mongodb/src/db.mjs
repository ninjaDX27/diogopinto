import {MongoClient} from "mongodb";

let client;
let ready;
export async function getDatabase(){
  const uri=process.env.MONGODB_URI;
  const name=process.env.MONGODB_DATABASE||"growth_intelligence_dev";
  if(!uri||uri.includes("REPLACE_")||(!uri.startsWith("mongodb://")&&!uri.startsWith("mongodb+srv://")))
    throw new Error("Configure a valid MONGODB_URI in local .env");
  if(!/^[A-Za-z0-9_-]+$/.test(name)||!name.endsWith("_dev"))
    throw new Error("This demo only accepts development databases ending in _dev");
  if(!ready){
    client=new MongoClient(uri,{maxPoolSize:10,serverSelectionTimeoutMS:7000});
    ready=(async()=>{
      await client.connect();
      const db=client.db(name);
      await db.collection("crm_leads").createIndex({tenantId:1,eventId:1},{unique:true});
      await db.collection("crm_leads").createIndex({tenantId:1,leadId:1},{unique:true});
      await db.collection("crm_leads").createIndex({tenantId:1,createdAt:-1});
      return db;
    })().catch(async error=>{ready=undefined;await client?.close();throw error});
  }
  return ready;
}
export async function closeDatabase(){await client?.close();ready=undefined;client=undefined;}
