import { getNumber } from './util';
export function blur(args = {}) {
  // * Horizontal blur. Default `2`
    const x = getNumber(args.x, 2);
    const stdDeviation = args.y != null && Number.isFinite(args.y) ? [x, args.y] : x;
    return `
    <filter>
      <feGaussianBlur stdDeviation="${stdDeviation}"/>
    </filter>
  `.trim();
}