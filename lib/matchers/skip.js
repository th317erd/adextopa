import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { stringToFetch }  from './fetch.js';
import { MatcherResult }  from '../results/matcher-result.js';

export const SkipMatcher = Utils.makeKeysNonEnumerable(class SkipMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'SkipMatcher';

  static name = 'Skip';

  constructor(_options) {
    let options    = _options || {};
    let matcher = options.matcher;

    if (!matcher)
      throw new TypeError('SkipMatcher: "matcher" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
      'updateCapturedRange': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        !!options.updateCapturedRange,
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
      matcherName,
      matcher,
      startOffset,
    } = matcherScope;

    if (!Utils.isType(matcher, 'Matcher', Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let matcherResult = await context.exec(matcher);
    let token         = matcherResult.token;

    if (token) {
      let newOffset = matcherResult.get(MatcherResult.PARSER_OFFSET, startOffset);

      if (this.updateCapturedRange) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Discarding resulting token (but still updating captured range).`);
        return context.updateParserOffsetResult(newOffset, matcherResult).setToken(null).setParserRange(null);
      } else {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Discarding resulting token (and not updating captured range).`);
        return context.updateParserOffsetResult(newOffset, matcherResult).setToken(null).setCapturedRange(null).setParserRange(null);
      }
    }

    return matcherResult;
  }
});

export const Skip = Matcher.createMatcherMethod((matcher) => {
  return new SkipMatcher({ matcher: stringToFetch(matcher) });
});

export const Discard = Matcher.createMatcherMethod((matcher) => {
  return new SkipMatcher({
    matcher:              stringToFetch(matcher),
    updateCapturedRange:  true,
  }).name('Discard');
});
