const {createDatabasePool}=require('./dist/database');
async function verify(){
 const pool=createDatabasePool(process.env.ADMIN_DATABASE_URL);
 try{
  const result=await pool.query("SELECT current_user AS role, has_table_privilege(current_user,'catalog_core.principal','UPDATE') AS can_grant_admin, has_table_privilege(current_user,'catalog_core.product','DELETE') AS can_delete, (SELECT count(*)::int FROM catalog_core.principal WHERE active) AS active_admins, (SELECT count(*)::int FROM catalog_core.product) AS drafts");
  const row=result.rows[0];if(row.role!=='cootton_catalog_admin'||row.can_grant_admin||row.can_delete||row.active_admins!==1)throw Error('UNSAFE_RUNTIME');
  console.log(JSON.stringify(row));
 }finally{await pool.end();}
}
verify().catch(()=>{console.error('ADMIN_RUNTIME_VERIFICATION_FAILED');process.exitCode=1;});
