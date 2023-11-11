import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';

export class MatchesMatcher extends Matcher {
  static name = 'Matches';

  constructor(_opts) {
    let opts = _opts || {};

    if (!(opts.matcher instanceof RegExp))
      throw new TypeError('MatchesMatcher: "matcher" property is required, and must be a RegExp instance.');

    super(opts);

    const getFlags = (_flags) => {
      let flags = (_flags || '').split('');
      if (flags.indexOf('g') < 0)
        flags.push('g');

      return flags.join('');
    };

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        new RegExp(opts.matcher.source, getFlags(opts.matcher.flags)),
      },
    });
  }

  exec(context) {
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));
    let matcher     = this.resolveValue(context, this.matcher, { wantPrimitiveValue: true });
    let start       = matcher.lastIndex = context.range.start;
    let source      = context.getSource();

    let result = matcher.exec(source);
    if (!result || result.index !== context.range.start) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match failed.`);
      return this.failResult();
    }

    if (matcher.lastIndex > context.range.end) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return this.failResult();
    }

    let range = new SourceRange(start, matcher.lastIndex);
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
    return new MatchesMatcher({ matcher: arguments[0] });
  else
    return new MatchesMatcher({ name: arguments[0], matcher: arguments[1] });
}
