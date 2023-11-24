import * as Utils       from '../utils.js';
import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';

export const SequenceMatcher = Utils.makeKeysNonEnumerable(class SequenceMatcher extends Matcher {
  static name = 'Sequence';

  constructor(_options) {
    let options       = _options || {};
    let startPattern  = options.startPattern;
    let endPattern    = options.endPattern;
    let escapePattern = options.escapePattern;
    let abortPatterns = options.abortPatterns;

    if (!Utils.isType(startPattern, 'String', 'RegExp', RegExp) && !Matcher.isVirtualMatcher(startPattern))
      throw new TypeError('SequenceMatcher: "startPattern" property is required, and must be a string, RegExp instance, or a virtual matcher.');

    if (!Utils.isType(endPattern, 'String', 'RegExp', RegExp) && !Matcher.isVirtualMatcher(endPattern))
      throw new TypeError('SequenceMatcher: "endPattern" property is required, and must be a string, RegExp instance, or a virtual matcher.');

    super(options);

    Object.defineProperties(this, {
      'startPattern': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        startPattern,
      },
      'endPattern': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        endPattern,
      },
      'escapePattern': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        escapePattern,
      },
      'abortPatterns': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        abortPatterns || [],
      },
    });
  }

  clone(options) {
    return super.clone({
      startPattern:   this.startPattern,
      endPattern:     this.endPattern,
      escapePattern:  this.escapePattern,
      abortPatterns:  this.abortPatterns,
      ...(options || {}),
    });
  }

  createMatcherScope(context) {
    const resolveArgument = (name, error) => {
      let value = context.resolveValue(this[name]);
      if (error && !Utils.isType(value, 'String', 'RegExp', RegExp))
        return context.panicResult(error);

      // Ensure all RegExp instances are cloned,
      // and have the global "g" flag set, otherwise
      // the RegExp.exec call below will not work.
      if (value instanceof RegExp)
        value = Utils.cloneRegExp(value, 'g');

      return value;
    };

    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      startPattern:   resolveArgument('startPattern', `${context.debugColor('fg:cyan', matcherScope.matcherName)}: "startPattern" must be a string or a RegExp.`),
      endPattern:     resolveArgument('endPattern', `${context.debugColor('fg:cyan', matcherScope.matcherName)}: "endPattern" must be a string or a RegExp.`),
      escapePattern:  resolveArgument('escapePattern'),
      abortPatterns:  context.resolveValue(this.abortPatterns),
    };
  }

  exec(matcherScope) {
    let {
      context,
      matcherName,
      startPattern,
      endPattern,
      escapePattern,
      abortPatterns,
      startOffset,
      endOffset,
    } = matcherScope;

    let range = new SourceRange({ start: startOffset, end: endOffset });

    // Optimization for string patterns
    if (Utils.isType(startPattern, 'String') && Utils.isType(endPattern, 'String')) {
      if ((range.start + (startPattern.length + endPattern.length)) > endOffset) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
        return context.failResult();
      }
    }

    let inputStream   = context.getInputStream();
    let compareLength = inputStream.compare(range, startPattern, true);

    if (compareLength === Utils.COMPARE_FAILURE) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed.`);
      return context.failResult();
    } else if (compareLength === Utils.COMPARE_OUT_OF_BOUNDS) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return context.failResult();
    }

    range.start += compareLength;

    let captureStart = range.start;
    for (; range.start < range.end;) {
      if (escapePattern) {
        let escapeLen = inputStream.compare(range, escapePattern, true);
        if (escapePattern && escapeLen > 0) {
          if (typeof escapePattern === 'string') {
            // For string escape patterns, we
            // only match against the escape
            // pattern itself, so we need to
            // add one extra to skip the character
            // that was escaped.
            range.start += (escapeLen + 1);
          } else {
            // For RegExp escape patterns, we are
            // expected to capture the entire
            // chunk that needs escaping
            range.start += escapeLen;
          }

          continue;
        }
      }

      if (abortPatterns && abortPatterns.length > 0) {
        let abortPatternIndex = abortPatterns.findIndex((pattern) => {
          return (inputStream.compare(range, pattern, true) > 0);
        });

        if (abortPatternIndex >= 0) {
          context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because abort pattern encountered at offset ${range.start} (pattern: ${context.debugValue(abortPatterns[abortPatternIndex])}).`);
          return context.failResult();
        }
      }

      compareLength = inputStream.compare(range, endPattern, true);
      if (compareLength > 0) {
        let captureEnd = range.start;
        range.start += compareLength;

        if (range.start > range.end) {
          context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because its out of bounds.`);
          return context.failResult();
        }

        let value         = inputStream.slice(captureStart, captureEnd);
        let capturedRange = new SourceRange({ start: captureStart, end: captureEnd });

        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match success ${context.debugColor('bg:cyan')}@${context.parserRange.start}-${range.start}${context.debugColor('bg:black')}: [${context.debugValue(value)}]`);

        return context.tokenResult({
          capturedRange:  capturedRange,
          matchedRange:   new SourceRange({ start: context.parserRange.start, end: range.start }),
          attributes:     {
            name:   matcherName,
            value:  value,
          },
        });
      } else {
        range.start++;
      }
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because its out of bounds.`);
    return context.failResult();
  }
});

export const Sequence = Matcher.createMatcherMethod((_, startPattern, endPattern, escapePattern, _abortPatterns) => {
  let abortPatterns = _abortPatterns;
  if (!Array.isArray(abortPatterns))
    abortPatterns = [ abortPatterns ];

  abortPatterns = abortPatterns.filter(Boolean);

  return new SequenceMatcher({
    startPattern,
    endPattern,
    escapePattern,
    abortPatterns,
  });
});
