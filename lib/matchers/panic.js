import * as Utils       from '../utils.js';
import { Matcher }  from '../matcher.js';

export const PanicMatcher = Utils.makeKeysNonEnumerable(class PanicMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'PanicMatcher';

  static name = 'Panic';

  static isConsuming() {
    return false;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let message = opts.message;

    if (!message)
      throw new TypeError('PanicMatcher: "message" property is required.');

    super(opts);

    Object.defineProperties(this, {
      'message': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        message,
      },
    });
  }

  async exec(context) {
    let matcherName = ('' + context.resolveValue(this.name, { wantPrimitiveValue: true }));
    let message     = context.resolveValue(this.message, { wantPrimitiveValue: true });

    if (typeof message === 'function') {
      try {
        message = message.call(this, { context, self: this, matcherName });
      } catch (e) {
        message = e.message;
      }
    } if (typeof message !== 'string')
      return this.panicResult(context, `${context.debugColor('fg:cyan', matcherName)}: "message" must be a string.`);

    return this.panicResult(context, message);
  }
});

export function Panic(message) {
  return new PanicMatcher({ message });
}
