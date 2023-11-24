import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { SourceRange }    from '../source-range.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { Token }          from '../token.js';

export const MessageMatcher = Utils.makeKeysNonEnumerable(class MessageMatcher extends Matcher {
  static name = 'Message';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};
    let message = options.message;

    if (!message)
      throw new TypeError('MessageMatcher: "message" property is required.');

    super(options);

    Object.defineProperties(this, {
      'message': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        message,
      },
      'recoveryHelper': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        options.recoveryHelper,
      },
    });
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      message:        context.resolveValueToString(this.message),
      recoveryHelper: context.resolveValue(this.recoveryHelper),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcherName,
      message,
      recoveryHelper,
      startOffset,
      typeName,
    } = matcherScope;

    if (typeof message !== 'string')
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "message" must be a string.`);

    let range = new SourceRange({ start: startOffset, end: startOffset });
    let value = context.getInputStream().slice(range.start, range.end);

    let result = context.tokenResult({
      capturedValue:  value,
      capturedRange:  range,
      matchedValue:   value,
      matchedRange:   range,
      attributes:     {
        name:   matcherName,
        value:  value,
      },
      message,
    });

    let token;

    if (typeof recoveryHelper === 'function') {
      token = result.token;

      let newResult = recoveryHelper.call(this, { ...matcherScope, token });

      if (Utils.isType(newResult, 'MatcherResult', MatcherResult)) {
        let newToken = newResult.token;
        if (newToken)
          token = newToken;

        result = newResult;
      } else if (Utils.isType(newResult, 'Token', Token)) {
        token = newResult;
        result.set(MatcherResult.TOKEN, newResult);
      } else if (newResult != null) {
        context.throwError(`${context.debugColor('fg:cyan', matcherName)}: Bad return value from "recoveryHelper" method.`);
      }
    }

    if (token) {
      range = token.matchedRange;
      result.setParserOffset(token.matchedRange.end);

      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Match success ${context.debugColor('bg:cyan')}@${range.start}-${range.end}${context.debugColor('bg:black')}: provided string "${message}" turned into an ${typeName} token.`);
    }

    return result;
  }
});

export const Message = Matcher.createMatcherMethod((_, message, recoveryHelper) => {
  return new MessageMatcher({ message, recoveryHelper });
});

export const Error = Matcher.createMatcherMethod((_, message, recoveryHelper) => {
  return new Message(message, recoveryHelper).name('Error');
});
