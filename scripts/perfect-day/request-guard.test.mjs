import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./request-guard.gs', import.meta.url), 'utf8');
const headers = ['request_id','submitted_at','first_name','email','marketing_consent','consent_version','is_test','delivery_status','gmail_message_id','marketing_status','updated_at'];
const key = 'a'.repeat(64); // Synthetic fixture, never a real credential.
const sample = {
  auth_key:key, request_id:'9d4ed988-7308-4bb9-98e1-573d0ca3744a',
  submitted_at:'2026-11-05T17:30:00Z', source:'sozo_website_book',
  form_type:'perfect_day_book', is_test:true, first_name:'SOZO Test',
  email:'book-workflow-test@example.com', book_request_consent:true,
  marketing_consent:false, sms_consent:false, consent_version:'perfect-day-request-v1'
};
function fixture(overrides = {}) {
  const properties = new Map(Object.entries({
    BOOK_REQUEST_KEY:key,BOOK_ENABLED:'true',BOOK_MODE:'test',
    BOOK_SHEET_ID:'synthetic-sheet',BOOK_TEST_EMAIL:sample.email,...overrides
  }));
  const rows = [[...headers]];
  let held=false, flushes=0, opens=0, onFind, failWrite=false, failFlush=false;
  const sheet = {
    getLastRow:()=>rows.length,
    getRange:(row,col,numRows,numCols)=>({
      getValues:()=>rows.slice(row-1,row-1+numRows).map(r=>r.slice(col-1,col-1+numCols)),
      setNumberFormat(){return this;},
      setValues(values){if(failWrite)throw Error('sensitive failure');rows[row-1]=[...values[0]];return this;},
      createTextFinder:search=>({
        matchEntireCell(){return this;},matchCase(){return this;},
        findNext(){
          if(onFind){const callback=onFind;onFind=undefined;callback();}
          const index=rows.findIndex((r,i)=>i>0&&r[0].toLowerCase()===search.toLowerCase());
          return index<0?null:{getRow:()=>index+1};
        }
      })
    })
  };
  const book={getId:()=> 'synthetic-sheet',getSheetByName:name=>name==='Requests'?sheet:null};
  const context=vm.createContext({
    PropertiesService:{getScriptProperties:()=>({
      getProperty:name=>properties.get(name)??null,
      setProperty:(name,value)=>properties.set(name,value)
    })},
    SpreadsheetApp:{
      getActiveSpreadsheet:()=>book,
      openById:id=>{opens++;assert.equal(id,'synthetic-sheet');return book;},
      flush:()=>{assert.equal(held,true,'flush while locked');if(failFlush)throw Error('private failure');flushes++;}
    },
    Utilities:{getUuid:()=> '11111111-1111-4111-8111-111111111111'},
    LockService:{getScriptLock:()=>({
      tryLock:()=>{if(held)return false;held=true;return true;},
      releaseLock:()=>{held=false;}
    })},
    ContentService:{MimeType:{JSON:'application/json'},createTextOutput:content=>({
      content,setMimeType(){return this;}
    })}
  });
  vm.runInContext(source,context,{filename:'request-guard.gs'});
  const post=(data=sample, type='application/json')=>JSON.parse(context.doPost({
    postData:{type,contents:typeof data==='string'?data:JSON.stringify(data)}
  }).content);
  return {
    context,properties,rows,post,
    get held(){return held;},get flushes(){return flushes;},get opens(){return opens;},
    set onFind(callback){onFind=callback;},
    set failWrite(value){failWrite=value;},set failFlush(value){failFlush=value;}
  };
}
test('a validated request is durably reserved before claimed is returned',()=>{
  const f=fixture();const result=f.post();
  assert.deepEqual(result,{ok:true,decision:'claimed',request_id:sample.request_id,row_number:2});
  assert.equal(f.rows.length,2);assert.equal(f.rows[1][7],'pending');
  assert.equal(f.rows[1][9],'not_requested');assert.equal(f.flushes,1);assert.equal(f.held,false);
  assert.equal(JSON.stringify(result).includes(sample.email),false);
  assert.equal(JSON.stringify(f.rows).includes(key),false);
});
test('same-ID replays stop but a new ID from the same email is allowed',()=>{
  const f=fixture();f.post();assert.equal(f.post().decision,'duplicate');
  assert.equal(f.post({...sample,request_id:sample.request_id.toUpperCase()}).decision,'duplicate');
  assert.equal(f.post({...sample,request_id:'f7532607-032b-4576-a206-c18c13c763b7'}).decision,'claimed');
  assert.equal(f.rows.length,3);
});
test('an overlapping claim cannot pass the locked read/write section',()=>{
  const f=fixture();f.post();let overlapping;
  const next={...sample,request_id:'f7532607-032b-4576-a206-c18c13c763b7'};
  f.onFind=()=>{overlapping=f.post(next);};
  assert.equal(f.post(next).decision,'claimed');
  assert.deepEqual(overlapping,{ok:false,decision:'busy'});
  assert.equal(f.post(next).decision,'duplicate');assert.equal(f.rows.length,3);
});
test('missing authentication, malformed input and disabled configuration never open the ledger',()=>{
  for(const config of [{BOOK_ENABLED:'false'},{BOOK_MODE:'unknown'},{BOOK_SHEET_ID:''},{BOOK_REQUEST_KEY:''}]){
    const f=fixture(config);assert.equal(f.post().ok,false);assert.equal(f.opens,0);
  }
  const f=fixture();
  for(const data of [{...sample,auth_key:''},{...sample,auth_key:'b'.repeat(64)},'broken JSON','[]','null']){
    assert.equal(f.post(data).ok,false);
  }
  assert.equal(f.post(sample,'text/plain').ok,false);
  assert.equal(f.opens,0);assert.equal(f.rows.length,1);
  assert.equal(f.context.doGet().content.includes('post_required'),true);
});
test('consent, source, UUID, names, emails and timestamps are validated before taking a claim',()=>{
  const cases=[
    {book_request_consent:false},{sms_consent:true},{marketing_consent:'yes'},
    {is_test:'yes'},{source:'sozo_website'},{form_type:'assessment'},
    {consent_version:'wrong'},{request_id:'not-a-uuid'},{first_name:'Test\\nName'.replace('\\n','\n')},
    {first_name:''},{first_name:'X'.repeat(81)},{email:'invalid'},
    {email:'Name <test@example.com>'},{submitted_at:'invalid'},
  ];
  for(const change of cases){const f=fixture();assert.equal(f.post({...sample,...change}).ok,false);assert.equal(f.opens,0);}
});
test('test and live modes cannot be crossed and test emails are allowlisted',()=>{
  const f=fixture();assert.equal(f.post({...sample,email:'other@example.com'}).decision,'restricted');
  assert.equal(f.post({...sample,is_test:false}).decision,'restricted');
  const live=fixture({BOOK_MODE:'live'});
  assert.equal(live.post(sample).decision,'restricted');
  assert.equal(live.post({...sample,is_test:false}).decision,'claimed');
});
test('authenticated validation diagnostics reveal only fixed field names, never supplied values',()=>{
  const f=fixture();
  const result=f.post({...sample,first_name:'',book_request_consent:undefined,email:'private-invalid-value'});
  assert.equal(result.decision,'invalid_request');
  assert.equal(result.invalid_fields,'first_name, email, book_request_consent');
  assert.doesNotMatch(JSON.stringify(result),/private-invalid-value|example\.com/);
  assert.equal(JSON.stringify(result).includes(key),false);
  assert.equal(f.opens,0);
  const unauth=f.post({...sample,auth_key:'wrong',email:'private-invalid-value'});
  assert.equal(unauth.invalid_fields,undefined);
});
test('Zapier boolean strings normalize without treating arbitrary text as consent',()=>{
  const f=fixture();
  assert.equal(f.post({...sample,is_test:'true',book_request_consent:'true',sms_consent:'false',marketing_consent:'false'}).decision,'claimed');
  assert.equal(f.rows[1][4],'false');
});
test('case and whitespace in true/false text normalize without guessing consent',()=>{
  const f=fixture();
  assert.equal(f.post({
    ...sample,is_test:'True',book_request_consent:' TRUE ',sms_consent:'False',marketing_consent:' false '
  }).decision,'claimed');
  assert.equal(f.rows[1][4],'false');
  assert.equal(f.rows[1][6],'true');
  for(const invalid of [undefined,null,'','yes','no','1','0',1,0,[],['true'],{}]){
    assert.equal(f.context.bookBoolean_(invalid),undefined);
  }
  const noConsent=fixture().post({...sample,book_request_consent:' FALSE '});
  assert.equal(noConsent.ok,false);
  assert.equal(noConsent.invalid_fields,'book_request_consent');
  const sms=fixture().post({...sample,sms_consent:' TRUE '});
  assert.equal(sms.ok,false);assert.equal(sms.invalid_fields,'sms_consent');
});
test('formula-leading names and addresses are escaped; marketing still cannot send from this helper',()=>{
  const f=fixture({BOOK_TEST_EMAIL:'+test@example.com'});
  assert.equal(f.post({...sample,first_name:'=IMPORTXML("x")',email:'+test@example.com',marketing_consent:true}).decision,'claimed');
  assert.equal(f.rows[1][2],"'=IMPORTXML(\"x\")");assert.equal(f.rows[1][3],"'+test@example.com");
  assert.equal(f.rows[1][9],'pending');
  assert.doesNotMatch(source,/GmailApp|MailApp|UrlFetchApp/);
});
test('a failed or ambiguous write never grants sending permission and releases the lock',()=>{
  const f=fixture();f.failWrite=true;assert.equal(f.post().ok,false);assert.equal(f.held,false);
  f.failWrite=false;f.failFlush=true;assert.equal(f.post().ok,false);assert.equal(f.held,false);
  f.failFlush=false;assert.equal(f.post().decision,'duplicate');
});
test('changed headers fail closed rather than appending into the wrong columns',()=>{
  const f=fixture();f.rows[0][0]='wrong';
  assert.deepEqual(f.post(),{ok:false,decision:'ledger_unavailable'});assert.equal(f.rows.length,1);
});
test('one-time editor setup creates a private key and starts disabled without rotating existing settings',()=>{
  const f=fixture();
  f.properties.clear();f.context.setupBookRequestLog();
  assert.equal(f.properties.get('BOOK_REQUEST_KEY').length,64);
  assert.equal(f.properties.get('BOOK_ENABLED'),'false');assert.equal(f.properties.get('BOOK_MODE'),'test');
  const saved=f.properties.get('BOOK_REQUEST_KEY');f.properties.set('BOOK_ENABLED','true');
  f.context.setupBookRequestLog();
  assert.equal(f.properties.get('BOOK_REQUEST_KEY'),saved);assert.equal(f.properties.get('BOOK_ENABLED'),'true');
  f.properties.set('BOOK_SHEET_ID','other-sheet');
  assert.throws(()=>f.context.setupBookRequestLog(),/different ledger/);
});
