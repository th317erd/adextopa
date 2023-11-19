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

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      pattern: (context.resolveValue(this.pattern) + ''),
    };
  }

  exec(matcherScope) {
    let {
      context,
      startOffset,
      matcherName,
      pattern,
    } = matcherScope;

    if (!Utils.isType(pattern, 'String'))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "pattern" must be a string.`);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${context.debugColor('bg:cyan')}@${startOffset}-${context.parserRange.end}${context.debugColor('bg:black')} [${context.debugPosition()}]: Attempting to match against pattern [${context.debugValue(pattern)}]...`);

    let compareResult = context.getInputStream().compare(context.parserRange, pattern);

    if (compareResult === Utils.COMPARE_FAILURE) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed.`);
      return context.failResult();
    } else if (compareResult === Utils.COMPARE_OUT_OF_BOUNDS) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return context.failResult();
    }

    let range = new SourceRange(startOffset, startOffset + pattern.length);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match success ${context.debugColor('bg:cyan')}@${range.start}-${range.end}${context.debugColor('bg:black')}: [${context.debugValue(pattern)}]`);

    return context.tokenResult({
      name:           matcherName,
      capturedValue:  pattern,
      capturedRange:  range,
      matchedValue:   pattern,
      matchedRange:   range,
      value:          pattern,
    });
  }
});

export function Equals(pattern) {
  return new EqualsMatcher({ pattern });
}
