/** Depth direction of CSS Rx(pitch) Ry(yaw) Rz(roll), in the cropped source plane.
 * Synthetic depth-of-field: not a calibrated lens or semantic depth from a screenshot.
 */
export function planeFocus({pitch,yaw,roll,cropWidth,cropHeight,focusU,focusV,focusWidth,aperture}) {
 const rad=Math.PI/180,x=pitch*rad,y=yaw*rad,z=roll*rad;
 const dx=Math.sin(x)*Math.sin(z)-Math.cos(x)*Math.sin(y)*Math.cos(z);
 const dy=Math.sin(x)*Math.cos(z)+Math.cos(x)*Math.sin(y)*Math.sin(z);
 const slope=Math.hypot(dx,dy);
 if(slope<1e-6||aperture<=0)return {blur:0,mask:'none'};
 const gx=dx/slope,gy=dy/slope,extent=Math.abs(gx)*cropWidth+Math.abs(gy)*cropHeight;
 const focal=.5+((focusU-.5)*cropWidth*gx+(focusV-.5)*cropHeight*gy)/extent;
 const sharp=focusWidth/2,soft=Math.max(.04,focusWidth*.65);
 const pct=n=>`${n*100}%`;
 return {blur:aperture*Math.min(2,slope/.3),mask:`linear-gradient(${Math.atan2(gx,-gy)/rad}deg,black ${pct(focal-sharp-soft)},transparent ${pct(focal-sharp)},transparent ${pct(focal+sharp)},black ${pct(focal+sharp+soft)})`};
}
