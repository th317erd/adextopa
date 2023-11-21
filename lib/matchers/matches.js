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
        value:        options.pattern,
      },
      '_suppressIndices': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (options.suppressIndices != null) ? !!options.suppressIndices : false,
      },
    });
  }

  clone(options) {
    return super.clone({
      pattern:          this.pattern,
      suppressIndices:  this._suppressIndices,
      ...(options || {}),
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

    pattern = Utils.cloneRegExp(pattern, 'gd');

    let compareResult = context.getInputStream().compare(context.parserRange, pattern, true, true);
    if (compareResult === Utils.COMPARE_FAILURE) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed.`);
      return context.failResult();
    } else if (compareResult === Utils.COMPARE_OUT_OF_BOUNDS) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return context.failResult();
    }

    let matchedRange = new SourceRange(startOffset, startOffset + compareResult[0].length);
    let indices      = compareResult.indices;
    let capturedRange;

    if (indices && indices.length > 1) {
      capturedRange = new SourceRange().setStart(Infinity).setEnd(-Infinity);

      for (let i = 1, il = indices.length; i < il; i++) {
        let indexRange = indices[i];
        capturedRange.expandTo(new SourceRange(indexRange[0], indexRange[1]));
      }
    } else {
      capturedRange = new SourceRange(startOffset, startOffset + compareResult[0].length);
    }

    let value = context.getInputStream().slice(startOffset, matchedRange.end);

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match success ${context.debugColor('bg:cyan')}@${matchedRange.start}-${matchedRange.end}${context.debugColor('bg:black')}: [${context.debugValue(value)}]`);

    let arrayAttributes = {};

    if (this._suppressIndices !== true) {
      for (let i = 1, il = compareResult.length; i < il; i++)
        arrayAttributes[('' + (i - 1))] = compareResult[i];
    }

    return context.tokenResult({
      capturedValue:  value,
      capturedRange:  capturedRange,
      matchedValue:   value,
      matchedRange:   matchedRange,
      attributes:     {
        name:   matcherName,
        value:  value,
        ...arrayAttributes,
        ...(compareResult.groups || {}),
      },
    });
  }

  suppressIndices(set) {
    this._suppressIndices = !!set;
    return this;
  }
});

export const Matches = Matcher.createMatcherMethod((pattern) => {
  return new MatchesMatcher({ pattern });
});
