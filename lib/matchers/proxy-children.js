import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { stringToFetch }  from './fetch.js';

export const ProxyChildrenMatcher = Utils.makeKeysNonEnumerable(class ProxyChildrenMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'ProxyChildrenMatcher';

  static name = 'ProxyChildren';

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!matcher)
      throw new TypeError('ProxyChildrenMatcher: "matcher" property is required.');

    super(opts);

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
    let matcherName = ('' + context.resolveValue(this.name, { wantPrimitiveValue: true }));
    let matcher     = this.matcher;

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await context.exec(matcher);
    if (!result) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return this.failResult(context);
    }

    if (result.type === MatcherResult.RESULT_TOKEN) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Proxying captured token children.`, result.value);
      return this.tokenResult(context, result.value.isProxy(true));
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing unhandled result upstream.`);

    return result;
  }
});

export function ProxyChildren(matcher) {
  return new ProxyChildrenMatcher({ matcher: stringToFetch(matcher) });
}
