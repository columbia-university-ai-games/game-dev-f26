import type {Vec2, Direction, PublicMap} from './types.ts';
export const VECTORS: Record<Direction,Vec2>={N:{x:0,y:-1},NE:{x:Math.SQRT1_2,y:-Math.SQRT1_2},E:{x:1,y:0},SE:{x:Math.SQRT1_2,y:Math.SQRT1_2},S:{x:0,y:1},SW:{x:-Math.SQRT1_2,y:Math.SQRT1_2},W:{x:-1,y:0},NW:{x:-Math.SQRT1_2,y:-Math.SQRT1_2}};
export const distance=(a:Vec2,b:Vec2)=>Math.hypot(a.x-b.x,a.y-b.y);
export const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export const rounded=(p:Vec2):Vec2=>({x:Math.round(p.x*1000)/1000,y:Math.round(p.y*1000)/1000});
export function segmentDistance(p:Vec2,a:Vec2,b:Vec2):number {const dx=b.x-a.x,dy=b.y-a.y;const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return distance(p,{x:a.x+dx*t,y:a.y+dy*t});}
export function pointInPolygon(p:Vec2,poly:Vec2[]):boolean {let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
export function isWater(p:Vec2,map:PublicMap,radius=1.4):boolean {if(p.x<radius+1||p.x>map.width-radius-1||p.y<radius+1||p.y>map.height-radius-1)return false;return !map.reefs.some(poly=>pointInPolygon(p,poly)||poly.some((a,i)=>segmentDistance(p,a,poly[(i+1)%poly.length])<radius));}
function cross(a:Vec2,b:Vec2,c:Vec2):number{return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
function segmentGap(a:Vec2,b:Vec2,c:Vec2,d:Vec2):number {
 const ac=cross(a,b,c),ad=cross(a,b,d),ca=cross(c,d,a),cb=cross(c,d,b);
 if(ac*ad<=0&&ca*cb<=0&&Math.max(Math.min(a.x,b.x),Math.min(c.x,d.x))<=Math.min(Math.max(a.x,b.x),Math.max(c.x,d.x))+1e-9&&Math.max(Math.min(a.y,b.y),Math.min(c.y,d.y))<=Math.min(Math.max(a.y,b.y),Math.max(c.y,d.y))+1e-9)return 0;
 return Math.min(segmentDistance(a,c,d),segmentDistance(b,c,d),segmentDistance(c,a,b),segmentDistance(d,a,b));
}
export function canNavigate(a:Vec2,b:Vec2,map:PublicMap,radius=1.4):boolean {
 if(!isWater(a,map,radius)||!isWater(b,map,radius))return false;
 return !map.reefs.some(poly=>poly.some((c,i)=>segmentGap(a,b,c,poly[(i+1)%poly.length])<radius));
}
export function bearing(a:Vec2,b:Vec2):Direction {const angle=Math.atan2(b.x-a.x,-(b.y-a.y));return (['N','NE','E','SE','S','SW','W','NW'] as Direction[])[(Math.round(angle/(Math.PI/4))+8)%8];}
export function translated(a:Vec2,d:Direction,n:number):Vec2 {return rounded({x:a.x+VECTORS[d].x*n,y:a.y+VECTORS[d].y*n});}
export function navigateStep(a:Vec2,b:Vec2,speed:number,map:PublicMap,radius=.7):Vec2 {const d=distance(a,b);if(d<.01)return {...a};const direct=rounded({x:a.x+(b.x-a.x)/d*Math.min(d,speed),y:a.y+(b.y-a.y)/d*Math.min(d,speed)});if(canNavigate(a,direct,map,radius))return direct;const candidates=Object.keys(VECTORS).map(k=>translated(a,k as Direction,speed)).filter(p=>canNavigate(a,p,map,radius));candidates.sort((p,q)=>distance(p,b)-distance(q,b));return candidates[0]??{...a};}
// Stateless, keyed randomness: observation/render order cannot consume game randomness.
export function sample(seed:number,key:string,tick=0):number {let x=(seed^Math.imul(tick+1,0x9e3779b1))>>>0;for(const c of key)x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return (x>>>0)/4294967296;}
