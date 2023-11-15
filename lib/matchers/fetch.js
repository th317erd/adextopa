import * as Utils       from '../utils.js';
import { Token }          from '../token.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';

export const FetchMatcher = Utils.makeKeysNonEnumerable(class FetchMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'FetchMatcher';

  static name = 'Fetch';

  static isConsuming() {
    return false;
  }

  isVirtual() {
    return true;
  }

  constructor(_options) {
    let options    = _options || {};
    let keyName = options.keyName;

    if (typeof keyName !== 'string')
      throw new TypeError('FetchMatcher: "keyName" property is required.');

    super(options);

    Object.defineProperties(this, {
      'keyName': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        keyName,
      },
      'defaultValue': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (options.defaultValue == null) ? null : options.defaultValue,
      },
    });
  }

  [Matcher.VIRTUAL_RESOLVER](context, _options) {
    let options          = Object.assign(Object.create(_options || null), { defaultValue: this.defaultValue });
    let valueResolver = new ValueResolver(context, 'Fetch', options);
    return valueResolver.fetchProp(context, this.keyName, options);
  }

  async exec(context) {
    let value = context.resolveValue(this, { wantPrimitiveValue: false });
    if (value instanceof Token)
      return context.tokenResult(value);
    else if (value instanceof MatcherResult)
      return value;

    return context.skipResult(0);
  }
});

export function Fetch(keyName, defaultValue) {
  return new FetchMatcher({ keyName, defaultValue });
}

export function stringToFetch(value) {
  if (typeof value === 'string' || (value instanceof String))
    return Fetch(value);

  return value;
}
