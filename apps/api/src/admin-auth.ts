import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { firebaseApp } from './firebase-app';
import { getAuth } from 'firebase-admin/auth';

export interface AdminIdentity { project: string; subject: string; authTime: number }
export interface AdminRequest {
  headers: Record<string,string|string[]|undefined>;
  method: string;
  adminIdentity?: AdminIdentity;
}

/** Identity verification is separate from the database capability check. */
@Injectable()
export class AdminIdentityGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const project = process.env.FIREBASE_PROJECT_ID;
    if (project !== 'cootton-firebase' || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      throw new ServiceUnavailableException('ADMIN_NOT_CONFIGURED');
    }
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const authorization = request.headers.authorization;
    if (typeof authorization !== 'string' || !/^Bearer [A-Za-z0-9_.-]{1,8192}$/.test(authorization)) {
      throw new UnauthorizedException('AUTHENTICATION_REQUIRED');
    }
    try {
      const app = firebaseApp();
      const token = await getAuth(app).verifyIdToken(authorization.slice(7), true);
      const now = Math.floor(Date.now()/1000);
      if (token.aud !== project || token.iss !== `https://securetoken.google.com/${project}` ||
          !token.uid || token.firebase.sign_in_provider === 'anonymous' ||
          !Number.isInteger(token.auth_time) || token.auth_time > now || now - token.auth_time > 3600) {
        throw new Error('INVALID_IDENTITY');
      }
      request.adminIdentity = {project,subject:token.uid,authTime:token.auth_time};
      return true;
    } catch (error) {
      // An unavailable verifier never becomes a local email/token bypass.
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      if (['auth/id-token-expired','auth/id-token-revoked','auth/user-disabled','auth/user-not-found','auth/argument-error','auth/invalid-id-token'].includes(code) ||
          (error instanceof Error && error.message === 'INVALID_IDENTITY')) throw new UnauthorizedException('AUTHENTICATION_REQUIRED');
      throw new ServiceUnavailableException('AUTH_VERIFIER_UNAVAILABLE');
    }
  }
}
