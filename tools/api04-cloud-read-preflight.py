# PREP04-CLOUD-READ-001: existing operator access; no mutation/secret values.
import json,subprocess,datetime
PROJECT="cootton-firebase";REGION="asia-southeast1";BUCKET="cootton-catalog-media-524673981677"
def read(args):
    p=subprocess.run(["gcloud",*args,"--quiet","--format=json"],capture_output=True,text=True,timeout=90)
    if p.returncode: raise RuntimeError("READ_FAILED:"+args[0]+"/"+args[1]+":exit"+str(p.returncode))
    return json.loads(p.stdout)
def config(s):
    spec=s.get("spec",{});template=spec.get("template",{});runtime=template.get("spec",spec)
    metadata=s.get("metadata",{});annotations=template.get("metadata",metadata).get("annotations",{})
    containers=[]
    for c in runtime.get("containers",[]):
        env=[]
        for e in c.get("env",[]):
            item={"name":e.get("name")}
            if e.get("valueFrom"): item["secretReference"]=e["valueFrom"].get("secretKeyRef",{})
            elif e.get("name") in ["FIREBASE_PROJECT_ID","COOTTON_MEDIA_BUCKET","COOTTON_PUBLICATION_ENABLED","NODE_ENV","PORT","HOST"]: item["value"]=e.get("value")
            else:item["literalValuePresent"]=True
            env.append(item)
        containers.append({"image":c.get("image"),"resources":c.get("resources"),"ports":c.get("ports"),"environment":env})
    status=s.get("status",{})
    return {"name":metadata.get("name"),"serviceAccount":runtime.get("serviceAccountName"),"concurrency":runtime.get("containerConcurrency"),"timeoutSeconds":runtime.get("timeoutSeconds"),"scaling":{k:v for k,v in annotations.items() if k in ["autoscaling.knative.dev/minScale","autoscaling.knative.dev/maxScale","run.googleapis.com/cpu-throttling","run.googleapis.com/startup-cpu-boost"]},"containers":containers,"traffic":status.get("traffic"),"latestReadyRevision":status.get("latestReadyRevisionName"),"latestCreatedRevision":status.get("latestCreatedRevisionName"),"resolvedImageDigest":status.get("imageDigest"),"conditions":[{"type":c.get("type"),"status":c.get("status"),"reason":c.get("reason")} for c in status.get("conditions",[])],"url":status.get("url")}
report={"id":"PREP04-CLOUD-READ-001","atUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),"project":PROJECT,"services":[]}
try:
    accounts=set()
    for name in ["cootton-api","cootton-web"]:
        service=read(["run","services","describe",name,"--project="+PROJECT,"--region="+REGION]);sanitized=config(service);report["services"].append(sanitized)
        if sanitized["serviceAccount"]:accounts.add("serviceAccount:"+sanitized["serviceAccount"])
        revision=sanitized["latestReadyRevision"]
        if revision:report.setdefault("readyRevisions",[]).append(config(read(["run","revisions","describe",revision,"--project="+PROJECT,"--region="+REGION])))
    policy=read(["storage","buckets","get-iam-policy","gs://"+BUCKET,"--project="+PROJECT])
    report["bucketBindingsForAttachedAccounts"]=[{"role":b.get("role"),"members":[m for m in b.get("members",[]) if m in accounts],"condition":b.get("condition")} for b in policy.get("bindings",[]) if any(m in accounts for m in b.get("members",[]))]
    inherited=read(["projects","get-iam-policy",PROJECT])
    report["projectBindingsForAttachedAccounts"]=[{"role":b.get("role"),"members":[m for m in b.get("members",[]) if m in accounts],"condition":b.get("condition")} for b in inherited.get("bindings",[]) if any(m in accounts for m in b.get("members",[]))]
    report["scope"]="configured service/revision/IAM only; operator identity; no proof of runtime GCS operations; no secret value retrieval/write/deploy"
    print(json.dumps(report,indent=2))
except Exception as error:
    print(json.dumps({"id":report["id"],"status":"STOP","completed":report,"reason":str(error) if isinstance(error,RuntimeError) else type(error).__name__},indent=2))
    raise SystemExit(1)

