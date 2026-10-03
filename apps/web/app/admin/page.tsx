import type { Metadata } from 'next';
import AdminPanel from '../../components/admin-panel';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Quản trị Cootton',robots:{index:false,follow:false}};
export default function AdminPage(){
  const apiKey=process.env.NEXT_PUBLIC_FIREBASE_API_KEY??'',appId=process.env.NEXT_PUBLIC_FIREBASE_APP_ID??'';
  return <AdminPanel config={apiKey&&appId?{apiKey,appId,projectId:'cootton-firebase',authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN??'cootton-firebase.firebaseapp.com'}:null}/>;
}
