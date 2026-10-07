import { ServiceUnavailableException } from '@nestjs/common';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';

/** Shared backend identity: public media must work before the first Admin request. */
export function firebaseApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (projectId !== 'cootton-firebase' || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    throw new ServiceUnavailableException('FIREBASE_NOT_CONFIGURED');
  }
  const existing = getApps().find(app => app.name === 'cootton-admin');
  if (existing) {
    if (existing.options.projectId !== projectId) throw new ServiceUnavailableException('FIREBASE_PROJECT_MISMATCH');
    return existing;
  }
  return initializeApp({ projectId, credential: applicationDefault() }, 'cootton-admin');
}
