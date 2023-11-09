import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../matcher-result.js';

export class DiscardMatcher extends Matcher {
  static name = 'Discard';

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!matcher)
      throw new TypeError('DiscardMatcher: "matcher" property is required.');

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
    let matcherName = ('' + this.resolveValue(context, this.name));
    let matcher     = this.resolveValue(context, this.matcher);

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await matcher.run(context);
    if (!result) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return this.failResult(context);
    }

    if (result.type === MatcherResult.RESULT_TOKEN) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Discarding resulting token.`);
      return this.skipResult(context, result.value.matchedRange.end - context.range.start);
    }

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Nothing to discard.`);

    return result;
  }
}

export function Discard(matcher) {
  return new DiscardMatcher({ matcher });
}
