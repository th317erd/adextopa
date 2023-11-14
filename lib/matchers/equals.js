import * as Utils       from '../utils.js';
import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';
import { FetchMatcher } from './fetch.js';

export const EqualsMatcher = Utils.makeKeysNonEnumerable(class EqualsMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'EqualsMatcher';

  static name = 'Equals';

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!Utils.isType(matcher, 'String', FetchMatcher))
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
    let matcherName = ('' + context.resolvePrimitive(this.name));
    let matcher     = context.resolvePrimitive(this.matcher);

    if (!Utils.isType(matcher, 'String'))
      return this.panicResult(context, `${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a string.`);

    let start = context.startOffset;
    if ((start + matcher.length) > context.endOffset) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return this.failResult();
    }

    if (!context.getInputStream().compare(context.parserRange, matcher)) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed.`);
      return this.failResult();
    }

    let range = new SourceRange(start, start + matcher.length);
    let value = matcher;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match success ${context.debugColor('bg:cyan')}@${range.start}-${range.end}${context.debugColor('bg:black')}: [${context.debugValue(value)}]`);

    return context.tokenResult({
      name:           this.name,
      capturedValue:  value,
      capturedRange:  range,
      matchedValue:   value,
      matchedRange:   range,
      value:          value,
    });
  }
});

export function Equals(/* name?, matcher */) {
  if (arguments.length < 2)
    return new EqualsMatcher({ matcher: arguments[0] });
  else
    return new EqualsMatcher({ name: arguments[0], matcher: arguments[1] });
}
