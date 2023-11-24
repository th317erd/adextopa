import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { SourceRange }    from '../source-range.js';
import { stringToFetch }  from './fetch.js';

export const SeekMatcher = Utils.makeKeysNonEnumerable(class SeekMatcher extends Matcher {
  // static [Utils.TYPE_SYMBOL] = 'SeekMatcher';

  static name = 'Seek';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options    = _options || {};
    let {
      matcher,
      range,
    } = options;

    super(options);

    Object.defineProperties(this, {
      'range': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        range,
      },
      'matcher': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        matcher,
      },
    });
  }

  parseRange(context, _range) {
    let range = _range;
    if (!range || (range instanceof Matcher))
      return context.parserRange.clone();

    if (range instanceof SourceRange)
      return range.clone();

    if (typeof range === 'number' || range instanceof Number)
      return new SourceRange({ start: context.parserRange.start + range, end: context.parserRange.end });

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
      items = [ context.parserRange.start, context.parserRange.end ];
    else if (items.length === 1)
      items.push(undefined);

    let sourceLength = context.getInputRange().end;
    if (isInfinity(items[0]))
      items[0] = (items[0] > 0) ? sourceLength : 0;

    if (isInfinity(items[1]))
      items[1] = (items[1] < 0) ? 0 : sourceLength;

    let relative = (isNegative(items[0]) || isNegative(items[1]) || (typeof range === 'string' && range.indexOf('+') >= 0));
    if (items[0] == null)
      items[0] = (relative) ? 0 : context.parserRange.start;

    if (items[1] == null)
      items[1] = (relative) ? 0 : context.parserRange.end;

    if (!relative && items[0] > items[1]) {
      let tmp = items[0];
      items[0] = items[1];
      items[1] = tmp;
    }

    return new SourceRange({ start: items[0], end: items[1], relative });
  }

  getAbsoluteRange(context, range) {
    let sourceRange = this.parseRange(context, range);
    if (!sourceRange.isRelative())
      return sourceRange;

    return context
      .parserRange
      .clone()
      .addTo(sourceRange)
      .clampTo(context.getInputRange());
  }

  // Help me!
  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    let providedRange = context.resolveValueToSourceRange(this.range);
    let range         = this.getAbsoluteRange(context, providedRange);

    return {
      ...matcherScope,
      matcher: context.resolveValueToMatcher(this.matcher),
      range,
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcher,
      matcherName,
      range,
      startOffset,
      endOffset,
    } = matcherScope;

    if (!Utils.isType(matcher, 'Matcher', Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Seeking to range ${range} and running provided matcher.`);

    let newContext  = context.clone({ parserRange: range });
    let result      = await newContext.exec(matcher);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Resetting range back to original ${context.debugColor('bg:cyan')}@${startOffset}-${endOffset}${context.debugColor('bg:black')} after running provided matcher.`);

    return result.setParserRange(null).setParserOffset(null);
  }
});

export const Seek = Matcher.createMatcherMethod(function(_, range, matcher) {
  if (arguments.length < 3) {
    return new SeekMatcher({
      matcher: stringToFetch(range),
    });
  } else {
    return new SeekMatcher({
      range:    stringToFetch(range),
      matcher:  stringToFetch(matcher),
    });
  }
});
