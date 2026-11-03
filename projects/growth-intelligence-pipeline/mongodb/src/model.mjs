// Schema and transition rules shared by server and tests; demo metadata only.
export const STAGES=Object.freeze(["new","contacted","qualified","documented","approved","signed","lost"]);
const pattern=/^[A-Za-z0-9_-]{3,80}$/;
function isObject(x){return x!==null&&typeof x==="object"&&!Array.isArray(x);}
export function validateCreate(data){
  if(!isObject(data)) throw new TypeError("JSON object required");
  const keys=["eventId","campaignId","source","product"];
  if(Object.keys(data).some(key=>!keys.includes(key))) throw new TypeError("Unknown input field");
  for(const key of ["eventId","campaignId","source"]){
    if(typeof data[key]!=="string"||!pattern.test(data[key]))throw new TypeError("Invalid "+key);
  }
  if(!["mortgage","transfer","renovation"].includes(data.product))
    throw new TypeError("Invalid product");
  return {eventId:data.eventId,campaignId:data.campaignId,source:data.source,product:data.product};
}
export function validateStatus(data){
  if(!isObject(data))throw new TypeError("JSON object required");
  if(Object.keys(data).some(k=>!["eventId","status"].includes(k)))
    throw new TypeError("Unknown input field");
  if(typeof data.eventId!=="string"||!pattern.test(data.eventId))
    throw new TypeError("Invalid eventId");
  if(!STAGES.includes(data.status)||data.status==="new")
    throw new TypeError("Invalid target status");
  return {eventId:data.eventId,status:data.status};
}
export function canMove(from,to){
  if(!STAGES.includes(from)||!STAGES.includes(to)||from===to)return false;
  if(from==="lost"||from==="signed")return false;
  if(to==="lost")return true;
  return STAGES.indexOf(to)===STAGES.indexOf(from)+1;
}
export function safeProjection(item){
  return {leadId:item.leadId,campaignId:item.campaignId,source:item.source,
    product:item.product,status:item.status,createdAt:item.createdAt,updatedAt:item.updatedAt};
}
