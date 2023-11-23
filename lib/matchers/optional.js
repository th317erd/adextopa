import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { stringToFetch }  from './fetch.js';

export const OptionalMatcher = Utils.makeKeysNonEnumerable(class OptionalMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'OptionalMatcher';

  static name = 'Optional';

  constructor(_options) {
    let options = _options || {};
    let matcher = options.matcher;

    if (!matcher)
      throw new TypeError('OptionalMatcher: "matcher" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        matcher,
      },
    });
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher: context.resolveValueToMatcher(this.matcher),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcher,
      matcherName,
      startOffset,
    } = matcherScope;

    if (!Utils.isType(matcher, 'Matcher', Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await context.exec(matcher);
    if (result.failed) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided matcher failed. Skipping by ${context.debugColor('bg:cyan', '0')} instead.`);
      return context.updateParserOffsetResult(startOffset, result).setFailed(false);
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Success.`);

    return result;
  }
});

export const Optional = Matcher.createMatcherMethod((_, matcher) => {
  return new OptionalMatcher({ matcher: stringToFetch(matcher) });
});
