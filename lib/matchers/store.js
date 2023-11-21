import * as Utils   from '../utils.js';
import { Matcher }  from '../matcher.js';
import { MatcherResult } from '../results/matcher-result.js';

export const StoreMatcher = Utils.makeKeysNonEnumerable(class StoreMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'StoreMatcher';

  static name = 'Store';

  constructor(_options) {
    let options = _options || {};
    let keyName = options.keyName;

    if (!Utils.isType(keyName, 'String'))
      throw new TypeError('StoreMatcher: "keyName" property is required.');

    super(options);

    Object.defineProperties(this, {
      'keyName': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        keyName,
      },
      'value': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.value || null,
      },
    });
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      keyName:  context.resolveValue(this.keyName),
      value:    context.resolveValue(this.value),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      keyName,
      matcherName,
      startOffset,
      value,
    } = matcherScope;

    if (!keyName)
      return context.panicResult('Store: Specified key to set on scope is empty.');

    if (Utils.isType(value, Matcher)) {
      let matcherResult = await context.exec(value);
      let value2        = matcherResult;

      if (Utils.isType(matcherResult, 'MatcherResult', MatcherResult)) {
        if (matcherResult.token)
          value2 = matcherResult.token;
        else if (matcherResult.value != null)
          value2 = matcherResult.value;
      }

      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Storing property "${keyName}" with value: `, value2);
      context.set(keyName, value2);

      return matcherResult;
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Storing property "${keyName}" with value: `, value);
    context.set(keyName, value);

    return context.updateParserOffsetResult(startOffset);
  }
});

export const Store = Matcher.createMatcherMethod((keyName, value) => {
  return new StoreMatcher({ keyName, value });
});
