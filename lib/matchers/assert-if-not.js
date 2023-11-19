import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { stringToFetch }  from './fetch.js';

export const AssertIfNotMatcher = Utils.makeKeysNonEnumerable(class AssertIfNotMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'EqualsMatcher';

  static name = 'AssertIfNot';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options    = _options || {};
    let message = options.message;
    let matcher = options.matcher;

    if (!message)
      throw new TypeError('AssertIfNotMatcher: "message" property is required.');

    if (!matcher)
      throw new TypeError('AssertIfNotMatcher: "matcher" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
      'message': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        message,
      },
    });
  }

  // Help me!
  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher: context.resolveValue(this.matcher),
    };
  }

  async exec(matcherScope) {
    let matcherName = ('' + context.resolveValue(this.getName()));
    let matcher     = context.resolveValue(this.matcher);

    if (!Utils.isType(matcher, Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await context.exec(matcher);
    if (!result) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return context.failResult();
    }

    if (result.type === MatcherResult.RESULT_TOKEN) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: success, skipping by zero.`);

      return context.skipResult(0);
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: failing!`);

    let errorMessage = ('' + context.resolveValue(this.message));
    return context.panicResult(errorMessage);
  }
});

export function AssertIfNot(message, matcher) {
  return new AssertIfNotMatcher({ message, matcher: stringToFetch(matcher) });
}
