/** Prototype uses Ry(yaw) Rx(pitch) in a Y-up scene.
 * CSS is Y-down: invert pitch, then compose Ry Rx. Legacy remains byte-for-byte.
 */
export function planeOrientation(model,pitch,yaw,roll) {
 return model==='prototype'
  ? `rotateY(${yaw}deg) rotateX(${-pitch}deg) rotateZ(${roll}deg)`
  : `rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`;
}
