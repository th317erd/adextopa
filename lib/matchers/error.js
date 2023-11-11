import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';

const ADEXTOPA_TYPE = Symbol.for('/adextopa/types/type');

export class ErrorMatcher extends Matcher {
  static name = 'Error';

  static isConsuming() {
    return false;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let message = opts.message;

    if (!message)
      throw new TypeError('ErrorMatcher: "message" property is required.');

    super(opts);

    Object.defineProperties(this, {
      'message': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        message,
      },
      'recoveryHelper': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.recoveryHelper,
      },
    });
  }

  async exec(context) {
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));
    let message     = this.resolveValue(context, this.message, { wantPrimitiveValue: true });
    let source      = context.getSource();

    if (typeof message !== 'string')
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "message" must be a string.`);

    let range = new SourceRange(context.range.start, context.range.start);
    let value = source.substring(range.start, range.end);

    let result = this.tokenResult(context, {
      message,
      capturedValue: value,
      capturedRange: range,
      matchedValue:  value,
      matchedRange:  range,
      value:         value,
    });

    if (typeof this.recoveryHelper === 'function') {
      let token     = result.value;
      let newResult = this.recoveryHelper.call(this, { token, context, matcherName, message, self: this });
      if (newResult === token || newResult == null) {
        token
          .updateValueFromRange(source)
          .updateCapturedValueFromRange(source)
          .updateMatchedValueFromRange(source);

        range = token.matchedRange;
      } else if (newResult[ADEXTOPA_TYPE] === 'MatcherResult') {
        result = newResult;
      } else if (newResult[ADEXTOPA_TYPE] === 'Token') {
        result.value = newResult;
      } else {
        this.throwError(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Bad return value from "recoveryHelper" method.`);
      }
    }

    if (result && result.value)
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Match success ${this.debugColor(context, 'bg:cyan')}@${range.start}-${range.end}${this.debugColor(context, 'bg:black')}: Resulting error "${message}" turned into an Error token.`);

    return result;
  }
}

export function Error(message, recoveryHelper) {
  return new ErrorMatcher({ message, recoveryHelper });
}
