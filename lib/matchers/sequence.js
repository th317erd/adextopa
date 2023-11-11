import { Matcher }       from '../matcher.js';
import { SourceRange }   from '../source-range.js';
import { FetchMatcher }  from './fetch.js';

export class SequenceMatcher extends Matcher {
  static name = 'Sequence';

  constructor(_opts) {
    let opts          = _opts || {};
    let startMatcher  = opts.startMatcher;
    let endMatcher    = opts.endMatcher;
    let escapeMatcher = opts.escapeMatcher;

    if (startMatcher instanceof String)
      startMatcher = startMatcher.valueOf();

    if (typeof startMatcher !== 'string' && !(startMatcher instanceof FetchMatcher))
      throw new TypeError('SequenceMatcher: "startMatcher" property is required, and must be a string, or a Fetch matcher.');

    if (endMatcher instanceof String)
      endMatcher = endMatcher.valueOf();

    if (typeof endMatcher !== 'string' && !(endMatcher instanceof FetchMatcher))
      throw new TypeError('SequenceMatcher: "endMatcher" property is required, and must be a string, or a Fetch matcher.');

    super(opts);

    Object.defineProperties(this, {
      'startMatcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        startMatcher,
      },
      'endMatcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        endMatcher,
      },
      'escapeMatcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        escapeMatcher,
      },
    });
  }

  exec(context) {
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));

    let startPattern = this.resolveValue(context, this.startMatcher, { wantPrimitiveValue: true });
    if (typeof startPattern !== 'string')
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "startMatcher" must be a string.`);

    let endPattern = this.resolveValue(context, this.endMatcher, { wantPrimitiveValue: true });
    if (typeof endPattern !== 'string')
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "endMatcher" must be a string.`);

    let escapePattern = this.resolveValue(context, this.escapeMatcher, { wantPrimitiveValue: true });
    let offset        = context.range.start;
    let end           = context.range.end;

    if ((offset + (startPattern.length + endPattern.length)) > context.range.end) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match failed because it would go beyond the current parsing range.`);
      return this.failResult();
    }

    const compare = (source, offset, str) => {
      for (let i = 0, il = str.length; i < il; i++) {
        let c1 = str.charAt(i);
        let c2 = source.charAt(i + offset);

        if (c1 !== c2)
          return false;
      }

      return true;
    };

    let source = context.getSource();
    if (!compare(source, offset, startPattern)) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match failed.`);
      return this.failResult();
    }

    offset += startPattern.length;

    let captureStart = offset;
    for (; offset < end;) {
      if (escapePattern && compare(source, offset, escapePattern)) {
        offset += 2;
        continue;
      } else if (compare(source, offset, endPattern)) {
        let captureEnd = offset;
        offset += endPattern.length;

        if (offset > end)
          return this.failResult(context);

        let value         = source.substring(captureStart, captureEnd);
        let capturedRange = new SourceRange(captureStart, captureEnd);

        this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match success ${this.debugColor(context, 'bg:cyan')}@${context.range.start}-${offset}${this.debugColor(context, 'bg:black')}: [${this.debugValue(context, value)}]`);

        return this.tokenResult(context, {
          capturedValue: value,
          capturedRange: capturedRange,
          matchedValue:  source.substring(context.range.start, offset),
          matchedRange:  new SourceRange(context.range.start, offset),
          value:         value,
        });
      } else {
        offset++;
      }
    }

    return this.failResult(context);
  }
}

export function Sequence(name, startMatcher, endMatcher, escapeMatcher) {
  return new SequenceMatcher({
    name,
    startMatcher,
    endMatcher,
    escapeMatcher,
  });
}
