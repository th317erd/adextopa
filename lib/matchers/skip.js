import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { stringToFetch }  from './fetch.js';
import { SourceRange } from '../source-range.js';

export const SkipMatcher = Utils.makeKeysNonEnumerable(class SkipMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'SkipMatcher';

  static name = 'Skip';

  static isConsuming() {
    return true;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!matcher)
      throw new TypeError('SkipMatcher: "matcher" property is required.');

    super(opts);

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
        value:        !!opts.updateCapturedRange,
      },
    });
  }

  async exec(context) {
    let matcherName = ('' + context.resolveValue(this.name, { wantPrimitiveValue: true }));
    let matcher     = context.resolveValue(this.matcher);
    let start       = context.range.start;

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await context.exec(matcher);
    if (!result) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return this.failResult(context);
    }

    const buildSkipResponseFromResult = (result, doLogging) => {
      if (result.type === MatcherResult.RESULT_TOKEN) {
        if (doLogging) {
          if (this.updateCapturedRange)
            context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Discarding resulting token (but still updating captured range).`);
          else
            context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Discarding resulting token (and not updating captured range).`);
        }

        return this.skipResult(
          context,
          result.value.matchedRange.end - context.range.start,
          result,
          (this.updateCapturedRange) ? { capturedRange: result.value.capturedRange.clone() } : null,
        );
      } else if (result.type === MatcherResult.RESULT_SKIP) {
        if (doLogging) {
          if (this.updateCapturedRange)
            context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing "skip" result upstream (but still updating captured range).`);
          else
            context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing "skip" result upstream (and not updating captured range).`);
        }

        return this.skipResult(
          context,
          result.value,
          result.payload,
          (this.updateCapturedRange) ? { capturedRange: new SourceRange(start, start + result.value) } : null,
        );
      } else if (result.type === MatcherResult.RESULT_BREAK || result.type === MatcherResult.RESULT_CONTINUE) {
        if (doLogging) {
          let type = (result.type === MatcherResult.RESULT_BREAK) ? 'break' : 'continue';
          if (this.updateCapturedRange)
            context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing "${type}" result upstream (but still updating captured range).`);
          else
            context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing "${type}" result upstream (and not updating captured range).`);
        }

        return ((result.type === MatcherResult.RESULT_BREAK) ? this.breakResult : this.continueResult).call(
          this,
          context,
          result.value,
          (result.payload) ? buildSkipResponseFromResult(result.payload, false) : undefined,
        );
      }
    };

    let skipResult = buildSkipResponseFromResult(result, true);
    if (skipResult)
      return skipResult;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Nothing to discard.`);

    return result;
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
