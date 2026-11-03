import test from "node:test";
import assert from "node:assert/strict";
import {validateCreate,validateStatus,canMove} from "../src/model.mjs";
const base={eventId:"test_0001",campaignId:"search-home",source:"website",product:"mortgage"};
test("accepts permitted synthetic lead fields",()=>{
  assert.deepEqual(validateCreate(base),base);
});
test("rejects unknown or personal fields",()=>{
  assert.throws(()=>validateCreate({...base,email:"test@example.com"}));
  assert.throws(()=>validateCreate({...base,loanAmount:100000}));
  assert.throws(()=>validateCreate({...base,source:""}));
});
test("allows only explicit stage transitions",()=>{
  assert(canMove("new","contacted"));
  assert(canMove("contacted","qualified"));
  assert(canMove("approved","signed"));
  assert(canMove("qualified","lost"));
  assert(!canMove("new","signed"));
  assert(!canMove("lost","contacted"));
  assert(!canMove("signed","lost"));
});
test("checks status event schema",()=>{
  assert.deepEqual(validateStatus({eventId:"test_0002",status:"qualified"}),{
    eventId:"test_0002",status:"qualified"});
  assert.throws(()=>validateStatus({eventId:"test_0002",status:"approved",contact:"x"}));
});
