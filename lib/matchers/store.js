import * as Utils             from '../utils.js';
import { Matcher }            from '../matcher.js';
import { TokenMatcherResult } from '../results/token-matcher-result.js';

export const StoreMatcher = Utils.makeKeysNonEnumerable(class StoreMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'StoreMatcher';

  static name = 'Store';

  static TokenMatcherResult = Utils.makeKeysNonEnumerable(class StoreTokenMatcherResult extends TokenMatcherResult {
    async process(matcherScope, result) {
      let {
        context,
        keyName,
      } = matcherScope;

      context.set(keyName, result.value);

      return context.skipResult(0);
    }
  });

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
      keyName:  context.resolvePrimitive(this.keyName),
      value:    context.resolveValue(this.value),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      keyName,
      value,
    } = matcherScope;

    if (!keyName)
      return context.panicResult('Store: Specified key to set on scope is empty.');

    if (Utils.isType(value, Matcher)) {
      let matcherResult = await context.exec(value);

      let customMatcherResult = matcherScope.context.cloneToCustomMatcherResult(this, matcherResult);
      return await customMatcherResult.process(matcherScope, customMatcherResult);
    }

    context.set(keyName, value);

    return context.skipResult(0);
  }
});

export function Store(keyName, value) {
  return new StoreMatcher({ keyName, value });
}
