import { Matcher }  from '../matcher.js';

export class PanicMatcher extends Matcher {
  static name = 'Panic';

  constructor(_opts) {
    let opts    = _opts || {};
    let message = opts.message;

    if (!message)
      throw new TypeError('PanicMatcher: "message" property is required.');

    super({
      ...opts,
      consuming: false,
    });

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
      return this.errorResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "message" must be a string.`);

    return this.errorResult(context, message);
  }
}

export function Panic(message) {
  return new PanicMatcher({ message });
}
