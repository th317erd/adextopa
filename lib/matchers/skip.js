import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../matcher-result.js';
import { stringToFetch }  from './fetch.js';
import { SourceRange } from '../source-range.js';

export class SkipMatcher extends Matcher {
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
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));
    let matcher     = this.resolveValue(context, this.matcher);
    let start       = context.range.start;

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await matcher.run(context);
    if (!result) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return this.failResult(context);
    }

    if (result.type === MatcherResult.RESULT_TOKEN) {
      if (this.updateCapturedRange)
        this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Discarding resulting token (but still updating captured range).`);
      else
        this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Discarding resulting token (and not updating captured range).`);

      return this.skipResult(
        context,
        result.value.matchedRange.end - context.range.start,
        result,
        (this.updateCapturedRange) ? { capturedRange: result.value.capturedRange.clone() } : null,
      );
    } else if (result.type === MatcherResult.RESULT_SKIP) {
      if (this.updateCapturedRange)
        this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Passing skip result upstream (but still updating captured range).`);
      else
        this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Passing skip result upstream (and not updating captured range).`);

      return this.skipResult(
        context,
        result.value,
        result.payload,
        (this.updateCapturedRange) ? { capturedRange: new SourceRange(start, start + result.value) } : null,
      );
    }

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Nothing to discard.`);

    return result;
  }
}

export function Skip(matcher) {
  return new SkipMatcher({ matcher: stringToFetch(matcher) });
}

export function Discard(matcher) {
  return new SkipMatcher({ matcher: stringToFetch(matcher), updateCapturedRange: true });
}
