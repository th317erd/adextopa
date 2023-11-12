import * as Utils       from '../utils.js';
import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';

export class MatchesMatcher extends Matcher {
  static name = 'Matches';

  constructor(_opts) {
    let opts = _opts || {};
    if (!(opts.pattern instanceof RegExp) && !Matcher.isVirtualMatcher(opts.pattern))
      throw new TypeError('MatchesMatcher: "pattern" property is required, and must be a RegExp instance.');

    super(opts);

    Object.defineProperties(this, {
      'pattern': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        Utils.cloneRegExp(opts.pattern, 'g'),
      },
    });
  }

  exec(context) {
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));

    let pattern = this.resolveValue(context, this.pattern, { wantPrimitiveValue: true });
    if (typeof pattern === 'string' || pattern instanceof String)
      pattern = Utils.cloneRegExp(new RegExp(pattern), 'g');

    let start   = pattern.lastIndex = context.range.start;
    let source  = context.getSource();

    let result = pattern.exec(source);
    if (!result || result.index !== context.range.start) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match failed.`);
      return this.failResult();
    }

    if (pattern.lastIndex > context.range.end) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return this.failResult();
    }

    let range = new SourceRange(start, pattern.lastIndex);
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

export function Matches(/* name?, matcher */) {
  if (arguments.length < 2)
    return new MatchesMatcher({ pattern: arguments[0] });
  else
    return new MatchesMatcher({ name: arguments[0], pattern: arguments[1] });
}
