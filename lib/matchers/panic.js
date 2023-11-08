import { Matcher }  from '../matcher.js';

export class PanicMatcher extends Matcher {
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
    let matcherName = ('' + this.resolveValue(context, this.name));
    let message     = this.resolveValue(context, this.message);

    if (typeof message !== 'string')
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "message" must be a string.`);

    return this.panicResult(context, message);
  }
}

export function Panic(message) {
  return new PanicMatcher({ message });
}
