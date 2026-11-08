/** Same normalized size/softness ranges as Studio; CSS alpha mask on the crop.
 * None/bypass returns undefined to preserve existing frames exactly.
 */
export function planeMask(mode, size, softness, enabled=true) {
 if (!enabled || mode==='0') return undefined;
 const s=Math.max(0,Math.min(100,size))/100;
 const soft=Math.max(0,Math.min(100,softness))/100;
 if (mode==='1') {
  const radius=.12+s*.65;
  return `radial-gradient(ellipse 100% 80% at center, black ${radius*100}%, transparent ${(radius+.015+soft*.45)*100}%)`;
 }
 if (mode==='2') return `linear-gradient(to bottom, black ${s*.85*100}%, transparent ${Math.min(.999,s*.85+.05+soft*.6)*100}%)`;
 return undefined;
}
