const fs=require('node:fs'),path=require('node:path'),{Module,createRequire}=require('node:module');
// Inject only transport/credential boundaries; execute the compiled production reader.
module.exports=function loadReader(fetcher,initializer=()=>({options:{credential:{getAccessToken:async()=>({access_token:'transport-fixture'})}}})){
 const filename=path.resolve(__dirname,'../dist/media-read.js'),normal=createRequire(filename),mod=new Module(filename);mod.filename=filename;
 mod.require=id=>id==='fixture-fetch'?fetcher:id==='./firebase-app'?{firebaseApp:initializer}:normal(id);
 mod._compile("const fetch = require('fixture-fetch');\n"+fs.readFileSync(filename,'utf8'),filename);return mod.exports;
};
