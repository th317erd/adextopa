import * as Utils       from '../utils.js';
import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';
import { FetchMatcher } from './fetch.js';

export const EqualsMatcher = Utils.makeKeysNonEnumerable(class EqualsMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'EqualsMatcher';

  static name = 'Equals';

  constructor(_options) {
    let options = _options || {};
    let pattern = options.pattern;

    if (!Utils.isType(pattern, 'String', FetchMatcher))
      throw new TypeError('EqualsMatcher: "pattern" property is required, and must be a string, or a FetchMatcher instance.');

    super(options);

    Object.defineProperties(this, {
      'pattern': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        pattern,
      },
    });
  }

  exec(context) {
    let matcherName = ('' + context.resolvePrimitive(this.name));
    let pattern     = context.resolvePrimitive(this.pattern);

    if (!Utils.isType(pattern, 'String'))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "pattern" must be a string.`);

    let start         = context.startOffset;
    let compareResult = context.getInputStream().compare(context.parserRange, pattern);

    if (compareResult === Utils.COMPARE_FAILURE) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed.`);
      return context.failResult();
    } else if (compareResult === Utils.COMPARE_OUT_OF_BOUNDS) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return context.failResult();
    }

    let range = new SourceRange(start, start + pattern.length);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match success ${context.debugColor('bg:cyan')}@${range.start}-${range.end}${context.debugColor('bg:black')}: [${context.debugValue(pattern)}]`);

    return context.tokenResult({
      name:           this.name,
      capturedValue:  pattern,
      capturedRange:  range,
      matchedValue:   pattern,
      matchedRange:   range,
      value:          pattern,
    });
  }
});

export function Equals(/* name?, pattern */) {
  if (arguments.length < 2)
    return new EqualsMatcher({ pattern: arguments[0] });
  else
    return new EqualsMatcher({ name: arguments[0], pattern: arguments[1] });
}
