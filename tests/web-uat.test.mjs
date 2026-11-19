import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../apps/web/worker.mjs';
const get=(path,method='GET')=>worker.fetch(new Request('https://uat.example'+path,{method}));
test('landing labels simulation and exposes no credentials',async()=>{const r=get('/');assert.equal(r.status,200);assert.match(await r.text(),/bukan AI aktif/);assert.match(r.headers.get('content-security-policy'),/connect-src 'none'/);});
test('health reports actual limited capabilities',async()=>{assert.deepEqual(await get('/api/health').json(),{product:'Takane MIO',environment:'UAT',version:'0.0.32-dev',inference:false,desktopConnected:false,knowledgeRecords:0});});
test('static modules only and no mutating routes',()=>{assert.match(get('/app.js').headers.get('content-type'),/javascript/);assert.equal(get('/style.css').status,200);assert.equal(get('/api/chat','POST').status,405);assert.equal(get('/api/chat').status,404);});
test('privacy and caching headers on failures too',()=>{const r=get('/unknown');assert.equal(r.status,404);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-content-type-options'),'nosniff');});
