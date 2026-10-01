import { createDatabasePool } from './database';
async function verify():Promise<void>{
  const pool=createDatabasePool();
  try{
    const result=await pool.query(`SELECT current_user AS role,
      current_setting('default_transaction_read_only') AS readonly,
      has_table_privilege(current_user,'catalog_read.public_product','INSERT') AS can_insert,
      has_table_privilege(current_user,'catalog_read.public_product','SELECT') AS can_read_source,
      has_table_privilege(current_user,'catalog_read.visible_product','SELECT') AS can_read_public,
      has_schema_privilege(current_user,'catalog_read','CREATE') AS can_create,
      (SELECT count(*) FROM catalog_read.visible_product)::text AS visible_count`);
    const row=result.rows[0];
    if(row.role!=='cootton_catalog_reader'||row.readonly!=='on'||row.can_insert||row.can_read_source||row.can_create||!row.can_read_public)throw new Error();
    console.log(JSON.stringify({restrictedReader:true,publicOnly:true,visibleCount:row.visible_count,tlsCertificateValidation:true}));
  }finally{await pool.end();}
}
verify().catch(()=>{console.error('CATALOG_RUNTIME_VERIFY_FAILED');process.exitCode=1;});
