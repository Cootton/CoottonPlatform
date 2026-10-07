import { ForbiddenException, ConflictException } from '@nestjs/common';
import type { Pool, PoolClient } from 'pg';
import type { AdminRequest } from './admin-auth';

export const CATALOG_READ_OPERATIONS = ['session','list','detail','dictionaries','image','thumbnail','video','poster'] as const;
export const CATALOG_COMMAND_CAPABILITIES = Object.freeze({
  createDraft:'catalog.draft', saveDraft:'catalog.draft', saveIntake:'catalog.draft',
  addDictionary:'catalog.draft', uploadImage:'catalog.draft', setImageColor:'catalog.draft',
  uploadVideo:'catalog.draft', archive:'catalog.draft', submit:'catalog.review',
  approve:'catalog.review', returnDraft:'catalog.review', publish:'catalog.publish', unpublish:'catalog.publish'
} as const);
const publicationActions = new Set(['submit','approve','publish','returnDraft','unpublish']);
/** Existing human-owner slice only; not a staff/AI scoped-grant implementation. */
export function ownerCatalogCapabilities(): string[] {
  return ['catalog.read','catalog.draft',...(process.env.COOTTON_PUBLICATION_ENABLED==='true'?['catalog.review','catalog.publish']:[])];
}
export async function authorizeOwnerCatalog(db: Pick<Pool | PoolClient,'query'>, request: AdminRequest, operation:string):Promise<string> {
  const command=operation.startsWith('command:')?operation.slice(8):null;
  const known=command!==null?Object.hasOwn(CATALOG_COMMAND_CAPABILITIES,command):(CATALOG_READ_OPERATIONS as readonly string[]).includes(operation);
  if(!known)throw new ForbiddenException();
  const identity=request.adminIdentity;
  const now=Math.floor(Date.now()/1000);
  if(!identity || identity.project!=='cootton-firebase' || typeof identity.subject!=='string' || !identity.subject || identity.subject.length>128 ||
     !Number.isInteger(identity.authTime) || identity.authTime>now || now-identity.authTime>3600 ||
     typeof identity.signInProvider!=='string' || !identity.signInProvider || ['anonymous','custom'].includes(identity.signInProvider))throw new ForbiddenException();
  // Singleton is the explicitly bootstrapped human owner, never client roles/capability labels.
  const result=await db.query('SELECT id FROM catalog_core.principal WHERE project=$1 AND subject=$2 AND active AND singleton',[identity.project,identity.subject]);
  if(!result.rows[0])throw new ForbiddenException('NO_ADMIN_GRANT');
  if(command!==null && publicationActions.has(command) && process.env.COOTTON_PUBLICATION_ENABLED!=='true')throw new ConflictException('PUBLICATION_DISABLED');
  return result.rows[0].id as string;
}
