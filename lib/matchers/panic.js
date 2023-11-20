import * as Utils   from '../utils.js';
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

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      message: context.resolveValue(this.message),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcherName,
      message,
    } = matcherScope;

    if (typeof message === 'function') {
      try {
        message = message.call(this, { context, self: this, matcherName });
      } catch (e) {
        message = e.message;
      }
    } else if (typeof message !== 'string') {
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "message" must be a string.`);
    }

    return context.panicResult(message);
  }
});

export function Panic(message) {
  return new PanicMatcher({ message });
}
