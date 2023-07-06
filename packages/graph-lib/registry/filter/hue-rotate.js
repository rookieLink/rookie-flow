import { getNumber } from './util';
// 色调旋转
export function hueRotate(args = {}) {
    /**
   * The number of degrees around the color.
   *
   * Default `0`.
   */
    const angle = getNumber(args.angle, 0);
    return `
      <filter>
        <feColorMatrix type="hueRotate" values="${angle}"/>
      </filter>
    `.trim();
}