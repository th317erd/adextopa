import * as Utils             from '../utils.js';
import { Matcher }            from '../matcher.js';
import { stringToFetch }      from './fetch.js';
import { TokenMatcherResult } from '../results/token-matcher-result.js';

export const SkipMatcher = Utils.makeKeysNonEnumerable(class SkipMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'SkipMatcher';

  static name = 'Skip';

  static isConsuming() {
    return true;
  }

  static TokenMatcherResult = Utils.makeKeysNonEnumerable(class SkipTokenMatcherResult extends TokenMatcherResult {
    static [Utils.TYPE_SYMBOL] = 'SkipTokenMatcherResult';

    processChildren(_matcherScope, _matcherResult, _token) {
      // NOOP
    }

    async finalizeProcess(matcherScope, result) {
      let {
        context,
        matcherName,
        parserRange,
        processToken,
        thisMatcher,
      } = matcherScope;

      let token = result.value;

      if (processToken) {
        if (thisMatcher.updateCapturedRange) {
          context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Discarding resulting token (but still updating captured range).`);
          processToken.capturedRange.expandTo(token.capturedRange).clampTo(parserRange);
        } else {
          context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Discarding resulting token (and not updating captured range).`);
        }

        processToken.matchedRange.expandTo(token.matchedRange).clampTo(parserRange);
      }

      return await thisMatcher.nextMatcher.call(thisMatcher, matcherScope);
    }
  });

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
      matcher: context.resolveValue(this.matcher),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcherName,
      matcher,
    } = matcherScope;

    if (!Utils.isType(matcher, Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let matcherResult = await context.exec(matcher);
    // if (!result) {
    //   context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
    //   return context.failResult();
    // }

    // const buildSkipResponseFromResult = (result, doLogging) => {
    //   if (result.type === MatcherResult.RESULT_TOKEN) {
    //     if (doLogging) {
    //       if (this.updateCapturedRange)
    //         context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Discarding resulting token (but still updating captured range).`);
    //       else
    //         context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Discarding resulting token (and not updating captured range).`);
    //     }

    //     return context.skipResult(
    //       result.value.matchedRange.end - context.parserRange.start,
    //       result,
    //       (this.updateCapturedRange) ? { capturedRange: result.value.capturedRange.clone() } : null,
    //     );
    //   } else if (result.type === MatcherResult.RESULT_SKIP) {
    //     if (doLogging) {
    //       if (this.updateCapturedRange)
    //         context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing "skip" result upstream (but still updating captured range).`);
    //       else
    //         context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing "skip" result upstream (and not updating captured range).`);
    //     }

    //     return context.skipResult(
    //       result.value,
    //       result.payload,
    //       (this.updateCapturedRange) ? { capturedRange: new SourceRange(startOffset, startOffset + result.value) } : null,
    //     );
    //   } else if (result.type === MatcherResult.RESULT_BREAK || result.type === MatcherResult.RESULT_CONTINUE) {
    //     if (doLogging) {
    //       let type = (result.type === MatcherResult.RESULT_BREAK) ? 'break' : 'continue';
    //       if (this.updateCapturedRange)
    //         context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing "${type}" result upstream (but still updating captured range).`);
    //       else
    //         context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing "${type}" result upstream (and not updating captured range).`);
    //     }

    //     return ((result.type === MatcherResult.RESULT_BREAK) ? context.breakResult : context.continueResult).call(
    //       context,
    //       result.value,
    //       (result.payload) ? buildSkipResponseFromResult(result.payload, false) : undefined,
    //     );
    //   }
    // };

    // let skipResult = buildSkipResponseFromResult(result, true);
    // if (skipResult)
    //   return skipResult;

    // context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Nothing to discard.`);

    return matcherScope.context.cloneToCustomMatcherResult(this, matcherResult);
  }
});

export function Skip(matcher) {
  return new SkipMatcher({ matcher: stringToFetch(matcher) });
}

export function Discard(matcher) {
  return new SkipMatcher({
    name:                 'Discard',
    matcher:              stringToFetch(matcher),
    updateCapturedRange:  true,
  });
}
