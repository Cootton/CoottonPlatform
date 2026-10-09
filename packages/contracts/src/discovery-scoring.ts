/** Pure policy calculations. No grants, seller admission, billing or live ad serving. */
import { parseEntityId } from './index';
export interface DiscoveryWeights {readonly relevance:number;readonly verifiedReviews:number;readonly sellerTrust:number}
export interface DiscoverySignals {readonly relevance:number;readonly verifiedReviews:number|null;readonly sellerTrust:number|null}
function basisPoints(value:number):number {
  if(!Number.isInteger(value)||value<0||value>10000)throw new TypeError('INVALID_SCORE');
  return value;
}
export function discoveryScore(signals:DiscoverySignals,weights:DiscoveryWeights):number|null {
  const keys=['relevance','verifiedReviews','sellerTrust'] as const;
  if(keys.reduce((sum,key)=>sum+basisPoints(weights[key]),0)!==10000 || weights.relevance===0)throw new TypeError('INVALID_WEIGHTS');
  for(const key of keys)if(signals[key]!==null)basisPoints(signals[key]!);
  // Missing verified evidence is not a fabricated zero or an unverified rating.
  if(signals.verifiedReviews===null||signals.sellerTrust===null)return null;
  return Math.floor(keys.reduce((sum,key)=>sum+signals[key]!*weights[key],0)/10000);
}
export interface AuctionPolicy {
  readonly version:string;
  readonly minRelevance:number;
  readonly minQuality:number;
  readonly reserveCpmVnd:string;
  readonly slots:number;
}
export interface AuctionBid {
  readonly id:string;
  readonly productId:string;
  readonly cpmVnd:string;
  readonly relevance:number;
  readonly quality:number|null;
  readonly publicEligible:boolean;
}
function amount(value:string):bigint {
  if(typeof value!=='string'||!/^(0|[1-9][0-9]{0,14})$/.test(value))throw new TypeError('INVALID_CPM');
  return BigInt(value);
}
export interface AuctionRow extends AuctionBid {
  readonly auctionScore:string|null;
  readonly outcome:'SELECTED'|'NOT_SELECTED'|'INELIGIBLE';
  readonly reason:'PUBLICATION_REQUIRED'|'QUALITY_EVIDENCE_REQUIRED'|'BELOW_RELEVANCE'|'BELOW_QUALITY'|'BELOW_RESERVE'|null;
}
/** Simulation of proposed first-price quality-adjusted CPM, never charges money. */
export function simulateCpmAuction(bids:readonly AuctionBid[],policy:AuctionPolicy):readonly AuctionRow[] {
  if(typeof policy.version!=='string'||!/^[a-zA-Z0-9._-]{1,80}$/.test(policy.version)||!Number.isInteger(policy.slots)||policy.slots<1||policy.slots>4||!Array.isArray(bids)||bids.length>100)throw new TypeError('INVALID_AUCTION');
  basisPoints(policy.minRelevance);basisPoints(policy.minQuality);
  const reserve=amount(policy.reserveCpmVnd),ids=new Set<string>(),products=new Set<string>();
  const rows=bids.map(bid=>{
    parseEntityId(bid.productId);
    if(typeof bid.publicEligible!=='boolean')throw new TypeError('INVALID_ELIGIBILITY');
    if(!/^[a-zA-Z0-9_-]{1,80}$/.test(bid.id)||ids.has(bid.id)||products.has(bid.productId))throw new TypeError('DUPLICATE_BID');
    ids.add(bid.id);products.add(bid.productId);
    const cpm=amount(bid.cpmVnd);basisPoints(bid.relevance);if(bid.quality!==null)basisPoints(bid.quality);
    const reason:AuctionRow['reason']=!bid.publicEligible?'PUBLICATION_REQUIRED':bid.quality===null?'QUALITY_EVIDENCE_REQUIRED':bid.relevance<policy.minRelevance?'BELOW_RELEVANCE':bid.quality<policy.minQuality?'BELOW_QUALITY':cpm===0n||cpm<reserve?'BELOW_RESERVE':null;
    return {...bid,reason,auctionScore:reason===null?(cpm*BigInt(bid.quality!)).toString():null,outcome:reason===null?'NOT_SELECTED' as const:'INELIGIBLE' as const};
  });
  const eligible=rows.filter(row=>row.reason===null).sort((a,b)=>{
    const left=BigInt(a.auctionScore!),right=BigInt(b.auctionScore!);
    return left!==right?(left>right?-1:1):a.quality!==b.quality?b.quality!-a.quality!:a.id<b.id?-1:a.id>b.id?1:0;
  });
  const selected=new Set(eligible.slice(0,policy.slots).map(row=>row.id));
  return rows.map(row=>({...row,outcome:selected.has(row.id)?'SELECTED':row.outcome}));
}
