import * as Utils       from '../utils.js';
import { Matcher }  from '../matcher.js';

export const PanicMatcher = Utils.makeKeysNonEnumerable(class PanicMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'PanicMatcher';

  static name = 'Panic';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options    = _options || {};
    let message = options.message;

    if (!message)
      throw new TypeError('PanicMatcher: "message" property is required.');

    super(options);

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
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "message" must be a string.`);

    return context.panicResult(message);
  }
});

export function Panic(message) {
  return new PanicMatcher({ message });
}
