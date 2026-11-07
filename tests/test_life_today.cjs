const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// These fixtures never touch a user's browser or ledger.
function setup() {
  const ids = Object.fromEntries(['weight-status','weight-value','weight-detail','weight-goal','finance-status','finance-expense','finance-cash','finance-detail'].map(x => ['today-'+x,{textContent:''}]));
  const events = {};
  const weight = {user:{name:'<b>fixture</b>'},latest:{date:'2026-11-07',weight:70.5},goal:68,change:0,count:1,error:null};
  const finance = {status:'idle',asOf:null,expenseTotal:null,availableCash:null,error:null};
  const window = {
    OpsWeightNative:{isReady:()=>true,getSummary:()=>weight},
    OpsFinanceNative:{isReady:()=>true,getSummary:()=>finance},
    addEventListener:(type,fn)=>events[type]=fn
  };
  const document = {readyState:'complete',hidden:false,getElementById:id=>ids[id],querySelectorAll:()=>[],addEventListener(){}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/life-today.js'),'utf8'),{window,document});
  return {ids,weight,finance,emit:type=>events[type]?.()};
}

test('weight home summary shares records, preserves zero change and renders names as text',()=>{
  const {ids}=setup();
  assert.equal(ids['today-weight-value'].textContent,'70.5 kg');
  assert.match(ids['today-weight-detail'].textContent,/<b>fixture<\/b>/);
  assert.match(ids['today-weight-detail'].textContent,/0\.0 kg/);
  assert.match(ids['today-weight-goal'].textContent,/68\.0 kg/);
});
test('missing weight and read errors never become zero weight',()=>{
  const app=setup();app.weight.latest=null;app.weight.user=null;app.emit('ops:weight-data');
  assert.equal(app.ids['today-weight-value'].textContent,'—');
  app.weight.error='storage unavailable';app.emit('ops:weight-data');
  assert.match(app.ids['today-weight-status'].textContent,/暂时不可用/);
});
test('financial amounts appear only after an explicit successful read; valid zero is shown',()=>{
  const app=setup();
  assert.equal(app.ids['today-finance-expense'].textContent,'—');
  Object.assign(app.finance,{status:'ready',expenseTotal:0,availableCash:100,asOf:'2026-11-07'});
  app.emit('ops:finance-data');
  assert.equal(app.ids['today-finance-expense'].textContent,'¥0.00');
  assert.equal(app.ids['today-finance-cash'].textContent,'¥100.00');
  app.finance.status='locked';app.emit('ops:finance-data');
  assert.equal(app.ids['today-finance-expense'].textContent,'—');
  assert.equal(app.ids['today-finance-cash'].textContent,'—');
  assert.match(app.ids['today-finance-status'].textContent,/认证/);
});
test('failed refresh labels any last successful financial values as old data',()=>{
  const app=setup();Object.assign(app.finance,{status:'error',expenseTotal:12,availableCash:null,error:'offline'});app.emit('ops:finance-data');
  assert.equal(app.ids['today-finance-expense'].textContent,'¥12.00');
  assert.equal(app.ids['today-finance-cash'].textContent,'—');
  assert.match(app.ids['today-finance-detail'].textContent,/上次/);
});
