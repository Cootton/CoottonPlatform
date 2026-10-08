// Manual only: no Firebase user creation/revocation, no DB write or token files.
const assert=require('node:assert/strict'),{emitKeypressEvents}=require('node:readline');
const {AdminIdentityGuard}=require('../dist/admin-auth');
async function hidden(prompt){
 assert.ok(process.stdin.isTTY&&process.stdout.isTTY,'INTERACTIVE_TERMINAL_REQUIRED');
 process.stdout.write(prompt);emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);process.stdin.resume();
 return new Promise((resolve,reject)=>{let value='';
 const done=(error)=>{process.stdin.off('keypress',onKey);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');error?reject(error):resolve(value);};
 const onKey=(text,key={})=>{if(key.ctrl&&key.name==='c')return done(Error('CANCELLED'));if(key.name==='return'||key.name==='enter')return done();if(key.name==='backspace'){value=value.slice(0,-1);return;}if(!key.ctrl&&!key.meta&&text&&text.length===1){value+=text;process.stdout.write('*');}};
 process.stdin.on('keypress',onKey);
 });
}
(async()=>{
 assert.equal(process.env.COOTTON_API04_FIREBASE_VERIFY,'existing-human-read-only');
 assert.equal(process.env.FIREBASE_PROJECT_ID,'cootton-firebase');
 assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,undefined);
 const page=await fetch('https://cootton-web-agg2nh5esq-as.a.run.app/admin',{signal:AbortSignal.timeout(15000)});
 assert.equal(page.status,200);const keys=[...new Set((await page.text()).match(/AIza[0-9A-Za-z_-]{35}/g))];assert.equal(keys.length,1);
 let email=(await hidden('Existing Firebase Admin email (masked): ')).trim();
 let password=await hidden('Existing Firebase password (masked; not Google password): ');
 assert.ok(email&&password);
 const response=await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+keys[0],{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true}),signal:AbortSignal.timeout(20000)});
 email=undefined;password=undefined;
 const result=await response.json();
 if(!response.ok){console.error('REL04-FIREBASE-SDK-001 SIGN_IN_FAILED status='+response.status+' code='+(['INVALID_LOGIN_CREDENTIALS','INVALID_PASSWORD','EMAIL_NOT_FOUND','USER_DISABLED','TOO_MANY_ATTEMPTS_TRY_LATER','OPERATION_NOT_ALLOWED','API_KEY_INVALID','PASSWORD_LOGIN_DISABLED','MISSING_EMAIL'].includes(result.error?.message)?result.error.message:'SIGN_IN_REJECTED'));process.exitCode=1;return;}
 const token=result.idToken;assert.ok(typeof token==='string');delete result.refreshToken;
 const guard=new AdminIdentityGuard();
 const request=authorization=>({headers:authorization?{authorization}:{},method:'GET'});
 const check=async req=>guard.canActivate({switchToHttp:()=>({getRequest:()=>req})});
 await assert.rejects(check(request()),e=>e.getStatus()===401);
 const valid=request('Bearer '+token);assert.equal(await check(valid),true);
 assert.equal(valid.adminIdentity.project,'cootton-firebase');assert.equal(valid.adminIdentity.signInProvider,'password');
 const parts=token.split('.'),signature=parts[2];parts[2]=(signature[0]==='A'?'B':'A')+signature.slice(1);
 await assert.rejects(check(request('Bearer '+parts.join('.'))),e=>e.getStatus()===401);
 const session=await fetch('https://cootton-api-524673981677.asia-southeast1.run.app/v1/admin/session',{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)});
 assert.equal(session.status,200);
 console.log('REL04-FIREBASE-SDK-001 PASS: actual fresh password identity admitted by source guard with SDK revocation check; missing/tampered token401; deployed ACT006 owner session200; no UID/token persisted');
 // Token and credentials remain only in this short-lived process; no refresh, user mutation or private output.
})().catch(()=>{console.error('REL04-FIREBASE-SDK-001 FAILED: preserve only safe stage/status; no credential, UID or token output');process.exitCode=1;});
