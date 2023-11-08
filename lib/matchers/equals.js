import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';
import { FetchMatcher } from './fetch.js';

export class EqualsMatcher extends Matcher {
  static name = 'Equals';

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (matcher instanceof String)
      matcher = matcher.valueOf();

    if (typeof matcher !== 'string' && !(matcher instanceof FetchMatcher))
      throw new TypeError('EqualsMatcher: "matcher" property is required, and must be a string, or a Fetch matcher.');

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

  exec(context) {
    let matcherName = ('' + this.resolveValue(context, this.name));
    let matcher     = this.resolveValue(context, this.matcher);

    if (typeof matcher !== 'string')
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a string.`);

    let start = context.range.start;
    if ((start + matcher.length) > context.range.end) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return this.failResult();
    }

    let source  = context.getSource();
    let result  = source.indexOf(matcher, start);
    if (result !== start) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match failed.`);
      return this.failResult();
    }

    let range = new SourceRange(start, start + matcher.length);
    let value = source.substring(start, range.end);

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match success ${this.debugColor(context, 'bg:cyan')}@${range.start}-${range.end}${this.debugColor(context, 'bg:black')}: [${this.debugValue(context, value)}]`);

    return this.tokenResult(context, {
      capturedValue: value,
      capturedRange: range,
      matchedValue:  value,
      matchedRange:  range,
      value:         value,
    });
  }
}

export function Equals(/* name?, matcher */) {
  if (arguments.length < 2)
    return new EqualsMatcher({ matcher: arguments[0] });
  else
    return new EqualsMatcher({ name: arguments[0], matcher: arguments[1] });
}
