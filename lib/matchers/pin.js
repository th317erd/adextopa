import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../matcher-result.js';
import { Token }          from '../token.js';

export class PinMatcher extends Matcher {
  static name = 'Pin';

  static isConsuming() {
    return false;
  }

  isConsuming() {
    return false;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    super(opts);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
      'range': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        this._options.range,
      },
    });
  }

  async exec(context) {
    let matcherName = ('' + this.resolveValue(context, this.name));

    const createCustomRangeToken = (range) => {
      let source  = context.getSource();
      let value   = source.substring(range.start, range.end);

      return new Token(context, {
        parent:         null,
        name:           matcherName,
        capturedValue:  value,
        capturedRange:  range,
        matchedValue:   value,
        matchedRange:   range,
        value:          value,
        children:       [],
      });
    };

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Pinning location`);
    context.assignToScope({
      [matcherName]: createCustomRangeToken(context.range.clone()),
    });

    let matcher = this.resolveValue(context, this.matcher);
    if (matcher && (matcher instanceof Matcher)) {
      let result = await matcher.run(context);
      if (!result)
        return this.failResult(context);

      if (result.type === MatcherResult.RESULT_SKIP) {
        if (result.value === 0) {
          this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Not pinning range of matcher because matcher skipped by zero.`);
        } else {
          this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Matched skipped by more than zero. Capturing range and passing result upstream.`);
          context.assignToScope({ [matcherName]: context.range.clone().setEnd(context.range.start + result.value) });
        }
      } else if (result.type === MatcherResult.RESULT_TOKEN) {
        this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Matcher succeeded. Capturing result range.`);
        context.assignToScope({ [matcherName]: context.range.clone().setEnd(context.range.start + result.value) });
      }

      return result;
    }

    return this.skipResult(context, 0);
  }
}

export function Pin(matcher) {
  return new PinMatcher({ matcher });
}
