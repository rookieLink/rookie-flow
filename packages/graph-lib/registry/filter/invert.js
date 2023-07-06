import { getNumber } from './util';
export function invert(args = {}) {
    /**
   * The proportion of the conversion.
   * A value of `1` is completely inverted.
   * A value of `0` leaves the input unchanged.
   *
   * Default `1`.
   */
    const amount = getNumber(args.amount, 1);
    const amount2 = 1 - amount;
    return `
      <filter>
        <feComponentTransfer>
          <feFuncR type="table" tableValues="${amount} ${amount2}"/>
          <feFuncG type="table" tableValues="${amount} ${amount2}"/>
          <feFuncB type="table" tableValues="${amount} ${amount2}"/>
        </feComponentTransfer>
      </filter>
    `.trim();
}
