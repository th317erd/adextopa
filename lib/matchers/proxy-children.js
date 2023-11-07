import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../matcher-result.js';

export class ProxyChildrenMatcher extends Matcher {
  static name = 'ProxyChildren';

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!matcher)
      throw new TypeError('ProxyChildrenMatcher: "matcher" property is required.');

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
    });
  }

  async exec(context) {
    let matcherName = ('' + this.resolveValue(context, this.name));
    let matcher     = this.matcher;

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await matcher.run(context);
    if (!result) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return this.failResult(context);
    }

    if (result.type === MatcherResult.RESULT_TOKEN) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Proxying captured token children.`, result.value);
      return this.proxyChildrenResult(context, result.value);
    }

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Passing unhandled result upstream.`);

    return result;
  }
}

export function ProxyChildren(matcher) {
  return new ProxyChildrenMatcher({ matcher });
}
