import * as Utils   from '../utils.js';
import { Matcher }  from '../matcher.js';

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
      value,
      startOffset,
    } = matcherScope;

    if (!keyName)
      return context.panicResult('Store: Specified key to set on scope is empty.');

    if (Utils.isType(value, Matcher)) {
      let matcherResult = await context.exec(value);
      context.set(keyName, matcherResult);
      return matcherResult;
    }

    context.set(keyName, value);

    return context.updateParserOffsetResult(startOffset);
  }
});

export function Store(keyName, value) {
  return new StoreMatcher({ keyName, value });
}
