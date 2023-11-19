import * as Utils       from '../utils.js';
import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';

export const SequenceMatcher = Utils.makeKeysNonEnumerable(class SequenceMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'SequenceMatcher';

  static name = 'Sequence';

  constructor(_options) {
    let options          = _options || {};
    let startPattern  = options.startPattern;
    let endPattern    = options.endPattern;
    let escapePattern = options.escapePattern;
    let abortPatterns = options.abortPatterns;

    if (startPattern instanceof String)
      startPattern = startPattern.valueOf();

    if (typeof startPattern !== 'string' && !Matcher.isVirtualMatcher(startPattern) && !(startPattern instanceof RegExp))
      throw new TypeError('SequenceMatcher: "startPattern" property is required, and must be a string, RegExp instance, or a virtual matcher.');

    if (endPattern instanceof String)
      endPattern = endPattern.valueOf();

    if (typeof endPattern !== 'string' && !Matcher.isVirtualMatcher(endPattern) && !(endPattern instanceof RegExp))
      throw new TypeError('SequenceMatcher: "endPattern" property is required, and must be a string, RegExp instance, or a virtual matcher.');

    super(options);

    Object.defineProperties(this, {
      'startPattern': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        startPattern,
      },
      'endPattern': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        endPattern,
      },
      'escapePattern': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        escapePattern,
      },
      'abortPatterns': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        abortPatterns || [],
      },
    });
  }

  // Help me!
  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher: context.resolveValue(this.matcher),
    };
  }

  exec(matcherScope) {
    const resolveArgument = (name, error) => {
      let value = context.resolveValue(this[name]);
      if (value instanceof String)
        value = value.valueOf();

      if (error && (typeof value !== 'string' && !(value instanceof RegExp)))
        return context.panicResult(error);

      // Ensure all RegExp instances are cloned,
      // and have the global "g" flag set, otherwise
      // the RegExp.exec call below will not work.
      if (value instanceof RegExp)
        value = Utils.cloneRegExp(value, 'g');

      return value;
    };

    let matcherName   = ('' + context.resolveValue(this.getName()));
    let startPattern  = resolveArgument('startPattern', `${context.debugColor('fg:cyan', matcherName)}: "startPattern" must be a string or a RegExp.`);
    let endPattern    = resolveArgument('endPattern', `${context.debugColor('fg:cyan', matcherName)}: "endPattern" must be a string or a RegExp.`);
    let escapePattern = resolveArgument('escapePattern');
    let abortPatterns = context.resolveValue(this.abortPatterns);
    let offset        = context.parserRange.start;
    let end           = context.parserRange.end;

    // Optimization for string patterns
    if (typeof startPattern === 'string' && typeof endPattern === 'string') {
      if ((offset + (startPattern.length + endPattern.length)) > context.parserRange.end) {
        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
        return context.failResult();
      }
    }

    const compare = (source, offset, pattern) => {
      if (pattern instanceof RegExp) {
        pattern.lastIndex = offset;
        let result = pattern.exec(source);
        if (!result || result.index !== offset)
          return 0;

        return result[0].length;
      } else {
        for (let i = 0, il = pattern.length; i < il; i++) {
          let c1 = pattern.charAt(i);
          let c2 = source.charAt(i + offset);

          if (c1 !== c2)
            return 0;
        }

        return pattern.length;
      }
    };

    let source  = context.getSource();
    let len     = compare(source, offset, startPattern);

    if (!len) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed.`);
      return context.failResult();
    }

    offset += len;

    let captureStart = offset;
    for (; offset < end;) {
      let escapeLen = compare(source, offset, escapePattern);
      if (escapePattern && escapeLen > 0) {
        if (typeof escapePattern === 'string') {
          // For string escape patterns, we
          // only match against the escape
          // pattern itself, so we need to
          // add one extra to skip the character
          // that was escaped.
          offset += (escapeLen + 1);
        } else {
          // For RegExp escape patterns, we are
          // expected to capture the entire
          // chunk that needs escaping
          offset += escapeLen;
        }

        continue;
      }

      if (abortPatterns && abortPatterns.length > 0) {
        let abortPatternIndex = abortPatterns.findIndex((pattern) => (compare(source, offset, pattern) > 0));
        if (abortPatternIndex >= 0) {
          context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because abort pattern encountered at offset ${offset} (pattern: ${context.debugValue(abortPatterns[abortPatternIndex])}).`);
          return context.failResult();
        }
      }

      len = compare(source, offset, endPattern);
      if (len > 0) {
        let captureEnd = offset;
        offset += len;

        if (offset > end) {
          context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because its out of bounds.`);
          return context.failResult();
        }

        let value         = source.substring(captureStart, captureEnd);
        let capturedRange = new SourceRange(captureStart, captureEnd);

        context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match success ${context.debugColor('bg:cyan')}@${context.parserRange.start}-${offset}${context.debugColor('bg:black')}: [${context.debugValue(value)}]`);

        return context.tokenResult({
          capturedValue: value,
          capturedRange: capturedRange,
          matchedValue:  source.substring(context.parserRange.start, offset),
          matchedRange:  new SourceRange(context.parserRange.start, offset),
          value:         value,
        });
      } else {
        offset++;
      }
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match failed because its out of bounds.`);
    return context.failResult();
  }
});

export function Sequence(startPattern, endPattern, escapePattern, _abortPatterns) {
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
}
