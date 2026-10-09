import { cache } from 'react';
import { publicProduct, publicSearchPage, searchQuery, type CatalogSearch, type CatalogPage, type CatalogDetail } from '@cootton/contracts';

export class CatalogUnavailable extends Error {}
async function read(path:string):Promise<unknown|null>{
  const origin=new URL(process.env.CATALOG_API_ORIGIN ?? 'http://127.0.0.1:3001');
  if(!['http:','https:'].includes(origin.protocol)||origin.username||origin.password||origin.search||origin.hash) throw new CatalogUnavailable();
  try{
    const response=await fetch(new URL(path,origin),{cache:'no-store',signal:AbortSignal.timeout(18000)});
    if(response.status===404) return null;
    if(!response.ok) throw new Error();
    const body=await response.text(); if(body.length>1000000) throw new Error();
    return JSON.parse(body);
  }catch{throw new CatalogUnavailable();}
}
export async function listCatalog(query:URLSearchParams):Promise<CatalogPage>{
  const value=await read(`/v1/catalog/products?${query}`) as CatalogPage|null;
  if(!value||!Array.isArray(value.items)||value.items.length>50||value.commerceEnabled!==false) throw new CatalogUnavailable();
  return {...value,items:value.items.map(publicProduct)};
}
export async function searchCatalog(input:CatalogSearch):Promise<CatalogPage>{
  try { return publicSearchPage(await read(`/v1/catalog/search?${searchQuery(input)}`),input.mode,input.limit); }
  catch { throw new CatalogUnavailable(); }
}
export const getProduct=cache(async(id:string,skuAfter?:string):Promise<CatalogDetail|null>=>{
  const query=skuAfter?`?skuAfter=${encodeURIComponent(skuAfter)}`:'';
  const value=await read(`/v1/catalog/products/${encodeURIComponent(id)}${query}`) as CatalogDetail|null;
  if(!value) return null;
  if(!value.skus||!Array.isArray(value.skus.items)||value.skus.items.length>20||value.commerceEnabled!==false) throw new CatalogUnavailable();
  return {...value,product:publicProduct(value.product)};
});
