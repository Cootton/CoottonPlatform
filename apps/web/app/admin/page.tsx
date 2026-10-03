import type { Metadata } from 'next';
import AdminPanel from '../../components/admin-panel';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Quản trị Cootton',robots:{index:false,follow:false}};
export default function AdminPage(){
  // Server runtime configuration: NEXT_PUBLIC values are inlined during image build.
  const apiKey=process.env.FIREBASE_WEB_API_KEY??'',appId=process.env.FIREBASE_WEB_APP_ID??'';
  return <AdminPanel config={apiKey&&appId?{apiKey,appId,projectId:'cootton-firebase',authDomain:process.env.FIREBASE_WEB_AUTH_DOMAIN??'cootton-firebase.firebaseapp.com'}:null}/>;
}
