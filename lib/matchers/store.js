import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';

export const StoreMatcher = Utils.makeKeysNonEnumerable(class StoreMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'StoreMatcher';

  static name = 'Store';

  constructor(_options) {
    let options    = _options || {};
    let keyName = options.keyName;

    if (typeof keyName !== 'string')
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

  async exec(context) {
    let keyName = context.resolveValue(this.keyName, { wantPrimitiveValue: true });
    if (!keyName)
      return context.panicResult('Store: Specified key to set on scope is empty.');

    let value = context.resolveValue(this.value);
    if (value instanceof Matcher) {
      let result = await context.exec(value);
      if (!result)
        return context.failResult();

      if (result.type === MatcherResult.RESULT_TOKEN)
        context.assign({ [keyName]: result.value });
      else if (result.type === MatcherResult.RESULT_SKIP && result.payload)
        context.assign({ [keyName]: result.payload });

      return result;
    }

    context.assign({ [keyName]: value });

    return context.skipResult(0);
  }
});

export function Store(keyName, value) {
  return new StoreMatcher({ keyName, value });
}
