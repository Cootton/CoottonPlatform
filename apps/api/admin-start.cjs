// Local private Admin runtime. No maintenance credentials are loaded here.
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
try{
 const credentialPath=path.resolve('.env.auth-verifier.json');
 const credential=JSON.parse(fs.readFileSync(credentialPath,'utf8'));
 if(credential.type!=='service_account'||credential.project_id!=='cootton-firebase'||credential.client_email!=='cootton-auth-verifier@cootton-firebase.iam.gserviceaccount.com'||typeof credential.private_key!=='string'||!credential.private_key.startsWith('-----BEGIN PRIVATE KEY-----'))throw Error('WRONG_VERIFIER');
 if(!fs.existsSync('.env.admin'))throw Error('ADMIN_CONFIGURATION_REQUIRED');
 const child=spawn(process.execPath,['--env-file=.env.admin','dist/main.js'],{stdio:'inherit',env:{...process.env,GOOGLE_APPLICATION_CREDENTIALS:credentialPath}});
 child.on('error',()=>{console.error('ADMIN_RUNTIME_START_FAILED');process.exitCode=1;});
 child.on('exit',code=>{process.exitCode=code??1;});
}catch{
 console.error('ADMIN_REQUIRES_PRIVATE_AUTH_VERIFIER_CREDENTIAL_AND_SCOPED_DATABASE_CONFIG');process.exitCode=1;
}
