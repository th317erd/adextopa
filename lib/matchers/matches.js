import * as Utils       from '../utils.js';
import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';

export const MatchesMatcher = Utils.makeKeysNonEnumerable(class MatchesMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'MatchesMatcher';

  static name = 'Matches';

  constructor(_options) {
    let options = _options || {};
    if (!Utils.isType(options.pattern, RegExp) && !Matcher.isVirtualMatcher(options.pattern))
      throw new TypeError('MatchesMatcher: "pattern" property is required, and must be a RegExp instance.');

    super(options);

    Object.defineProperties(this, {
      'pattern': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        Utils.cloneRegExp(options.pattern, 'g'),
      },
    });
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      pattern: context.resolveValue(this.pattern),
    };
  }

  exec(matcherScope) {
    let {
      context,
      startOffset,
      matcherName,
      pattern,
    } = matcherScope;

    if (Utils.isType(pattern, 'String'))
      pattern = Utils.cloneRegExp(new RegExp(pattern), 'g');

    let compareResult = context.getInputStream().compare(context.parserRange, pattern, true);

    if (compareResult === Utils.COMPARE_FAILURE) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed.`);
      return context.failResult();
    } else if (compareResult === Utils.COMPARE_OUT_OF_BOUNDS) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return context.failResult();
    }

    let range = new SourceRange(startOffset, pattern.lastIndex);
    let value = context.getInputStream().slice(startOffset, range.end);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match success ${context.debugColor('bg:cyan')}@${range.start}-${range.end}${context.debugColor('bg:black')}: [${context.debugValue(value)}]`);

    return context.tokenResult({
      name:           matcherName,
      capturedValue:  value,
      capturedRange:  range,
      matchedValue:   value,
      matchedRange:   range,
      value:          value,
    });
  }
});

export function Matches(pattern) {
  return new MatchesMatcher({ pattern });
}
