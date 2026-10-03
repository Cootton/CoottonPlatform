import { parseEntityId } from './index';

export function inputObject(value:unknown,keys:readonly string[]):Record<string,unknown> {
  if(!value||typeof value!=='object'||Array.isArray(value)) throw new TypeError('INVALID_INPUT');
  const object=value as Record<string,unknown>;
  if(Object.keys(object).some(k=>!keys.includes(k))) throw new TypeError('INVALID_INPUT');
  return object;
}
export function inputText(value:unknown,max:number,required=true):string {
  if(typeof value!=='string') throw new TypeError('INVALID_INPUT');
  const text=value.trim();if((required&&!text)||Array.from(text).length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text))throw new TypeError('INVALID_INPUT');return text;
}
export function inputVersion(value:unknown):string {
  if(typeof value!=='string'||!/^[1-9][0-9]{0,18}$/.test(value)||BigInt(value)>9223372036854775806n)throw new TypeError('INVALID_INPUT');return value;
}
export function optionalId(value:unknown):string|null {return value===null?null:parseEntityId(value);}
export const DRAFT_FIELDS=['title','description','care','categoryId','brandId','formId','countryId','originEvidenceId','careEvidenceId'] as const;
export function draftFields(value:unknown):Record<string,string|null>{
  const o=inputObject(value,DRAFT_FIELDS),result:Record<string,string|null>={};
  for(const key of DRAFT_FIELDS){if(!(key in o))throw new TypeError('INVALID_INPUT');result[key]=['title','description','care'].includes(key)?inputText(o[key],key==='title'?160:key==='care'?2000:10000,false):optionalId(o[key]);}
  return result;
}
