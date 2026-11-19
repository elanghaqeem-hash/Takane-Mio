import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutGalaxy,renderBudget,coreColor} from '../apps/desktop/galaxy.mjs';
const rec=(id,cluster='a')=>({id,cluster,indexed:true,authorized:true});
test('empty knowledge has no stars',()=>assert.deepEqual(layoutGalaxy([]),{total:0,visible:0,stars:[]}));
test('excludes unauthorized, unindexed, malformed and duplicate records',()=>{const result=layoutGalaxy([rec('1'),rec('1'),{...rec('2'),authorized:false},{...rec('3'),indexed:false},null,rec('')]);assert.equal(result.total,1);assert.equal(result.stars[0].id,'1');});
test('deterministic ordering and coordinates',()=>assert.deepEqual(layoutGalaxy([rec('2'),rec('1')]),layoutGalaxy([rec('1'),rec('2')])));
test('hardware budget caps visible stars without inflating total',()=>{const result=layoutGalaxy(Array.from({length:200},(_,i)=>rec(String(i))),'LIGHT');assert.equal(result.total,200);assert.equal(result.visible,160);assert.equal(renderBudget('ADVANCED'),1200);});
test('STOP and ERROR have warning color',()=>{assert.equal(coreColor('STOPPED'),'#ed7888');assert.equal(coreColor('ERROR'),'#ed7888');assert.notEqual(coreColor('IDLE'),coreColor('STOPPED'));});
