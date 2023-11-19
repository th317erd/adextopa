import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { stringToFetch }  from './fetch.js';

export const ProxyChildrenMatcher = Utils.makeKeysNonEnumerable(class ProxyChildrenMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'ProxyChildrenMatcher';

  static name = 'ProxyChildren';

  constructor(_options) {
    let options    = _options || {};
    let matcher = options.matcher;

    if (!matcher)
      throw new TypeError('ProxyChildrenMatcher: "matcher" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
    });
  }

  async exec(matcherScope) {
    let matcherName = ('' + context.resolveValue(this.getName()));
    let matcher     = this.matcher;

    if (!Utils.isType(matcher, Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await context.exec(matcher);
    if (!result) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return context.failResult();
    }

    if (result.type === MatcherResult.RESULT_TOKEN) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Proxying captured token children.`, result.value);
      return context.tokenResult(result.value.isProxy(true));
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing unhandled result upstream.`);

    return result;
  }
});

export function ProxyChildren(matcher) {
  return new ProxyChildrenMatcher({ matcher: stringToFetch(matcher) });
}
