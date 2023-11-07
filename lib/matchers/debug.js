import { Matcher }  from '../matcher.js';

export class DebugMatcher extends Matcher {
  static name = 'Debug';

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!matcher)
      throw new TypeError('DebugMatcher: "matcher" property is required.');

    super({
      ...opts,
      consuming: true,
    });

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
      'silent': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        this._options.silent,
      },
    });
  }

  async exec(context) {
    context.setDebugMode(!this.silent);

    let matcherName = ('' + this.resolveValue(context, this.name));
    let matcher     = this.resolveValue(context, this.matcher);

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await matcher.run(context);
    if (!result)
      return this.failResult(context);

    return result;
  }
}

export function Debug(matcher) {
  return new DebugMatcher({ matcher });
}

export function Silent(matcher) {
  return new DebugMatcher({ matcher, silent: true });
}
