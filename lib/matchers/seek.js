import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../matcher-result.js';
import { Token }          from '../token.js';
import { SourceRange }    from '../source-range.js';

export class SeekMatcher extends Matcher {
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
    });
  }

  parseRange(context, _range) {
    let range = _range;
    if (!range)
      return context.range.clone();

    if (range instanceof SourceRange)
      return range.clone();

    if (typeof range === 'number' || range instanceof Number)
      return new SourceRange(context.range.start + range, context.range.end);

    const isInfinity = (value) => (Object.is(value, -Infinity) || Object.is(value, Infinity));
    const isNegative = (value) => (value < 0 || Object.is(value, -0));

    let infinityRE  = /^\s*[+-]infinity\s*$/i;
    let items       = (Array.isArray(range)) ? range : [ range.start, range.end ];
    if (typeof range === 'string' || range instanceof String)
      items = range.split(':');

    items = items
      .slice(0, 2)
      .map((p) => {
        if (p == null || Object.is(p, Infinity) || Object.is(p, -Infinity))
          return p;

        if (infinityRE.test(p))
          return (p.trim().charAt(0) === '-') ? -Infinity : Infinity;

        if (typeof p === 'number')
          return p;

        if (p instanceof Number)
          return p.valueOf();

        if (p.trim() === '-0')
          return -0;

        let sp = ('' + p).replace(/[^\d+-]/g, '').replace(/[+-]+$/, '');
        if (!sp)
          return;

        return parseInt(sp, 10);
      });

    if (items.length === 0)
      items = [ context.range.start, context.range.end ];
    else if (items.length === 1)
      items.push(undefined);

    let sourceLength = context.getSource().length;
    if (isInfinity(items[0]))
      items[0] = (items[0] > 0) ? sourceLength : 0;

    if (isInfinity(items[1]))
      items[1] = (items[1] < 0) ? 0 : sourceLength;

    let isRelative = (isNegative(items[0]) || isNegative(items[1]) || (typeof range === 'string' && range.indexOf('+') >= 0));
    if (items[0] == null)
      items[0] = (isRelative) ? 0 : context.range.start;

    if (items[1] == null)
      items[1] = (isRelative) ? 0 : context.range.end;

    if (!isRelative && items[0] > items[1]) {
      let tmp = items[0];
      items[0] = items[1];
      items[1] = tmp;
    }

    return new SourceRange(items[0], items[1], isRelative);
  }

  getAbsoluteRange(context, range) {
    let sourceRange = this.parseRange(context, range);
    if (!sourceRange.isRelative())
      return sourceRange;

    return context
      .range
      .clone()
      .addRange(sourceRange)
      .ensureBounds({
        start:  0,
        end:    context.getSource().length,
      });
  }

  async exec(context) {
    let matcherName = ('' + this.resolveValue(context, this.name));

    return this.skipResult(context, 0);
  }
}

export function Seek(range, matcher) {
  return new SeekMatcher({ matcher });
}