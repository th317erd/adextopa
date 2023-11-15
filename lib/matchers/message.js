import * as Utils       from '../utils.js';
import { Matcher }      from '../matcher.js';
import { SourceRange }  from '../source-range.js';

const ADEXTOPA_TYPE = Symbol.for('/adextopa/types/type');

export const MessageMatcher = Utils.makeKeysNonEnumerable(class MessageMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'MessageMatcher';

  static name = 'Message';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options    = _options || {};
    let message = options.message;

    if (!message)
      throw new TypeError('MessageMatcher: "message" property is required.');

    super(options);

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
        value:        options.recoveryHelper,
      },
    });
  }

  async exec(context) {
    let matcherName = ('' + context.resolveValue(this.name, { wantPrimitiveValue: true }));
    let message     = context.resolveValue(this.message, { wantPrimitiveValue: true });
    let source      = context.getSource();

    if (typeof message !== 'string')
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "message" must be a string.`);

    let range = new SourceRange(context.parserRange.start, context.parserRange.start);
    let value = source.substring(range.start, range.end);

    let result = context.tokenResult({
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
        context.throwError(`${context.debugColor('fg:cyan', matcherName)}: Bad return value from "recoveryHelper" method.`);
      }
    }

    if (result && result.value)
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match success ${context.debugColor('bg:cyan')}@${range.start}-${range.end}${context.debugColor('bg:black')}: Resulting error "${message}" turned into an Message token.`);

    return result;
  }
});

export function Message(name, message, recoveryHelper) {
  return new MessageMatcher({ name, message, recoveryHelper });
}

export function Error(message, recoveryHelper) {
  return new Message('Error', message, recoveryHelper);
}
