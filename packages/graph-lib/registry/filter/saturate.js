import { getNumber } from './util';
export function saturate(args = {}) {
    /**
   * The proportion of the conversion.
   * A value of `1` is completely un-saturated.
   * A value of `0` leaves the input unchanged.
   *
   * Default `1`.
   */
    const amount = getNumber(args.amount, 1);
    return `
      <filter>
        <feColorMatrix type="saturate" values="${1 - amount}"/>
      </filter>
    `.trim();
}