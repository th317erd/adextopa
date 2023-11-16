import * as Utils         from '../utils.js';
import { Token }          from '../token.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';

export const FetchMatcher = Utils.makeKeysNonEnumerable(class FetchMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'FetchMatcher';

  static name = 'Fetch';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};
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

  [Utils.VIRTUAL_RESOLVER](context, _options) {
    let options = _options || {};
    return context.fetch(this.keyName, options.defaultValue);
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      value: context.resolvePrimitive(this),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      value,
    } = matcherScope;

    if (Utils.isType(value, Token))
      return context.tokenResult(value);
    else if (Utils.isType(value, MatcherResult))
      return value;

    return context.skipResult(0);
  }
});

export function Fetch(keyName, defaultValue) {
  return new FetchMatcher({ keyName, defaultValue });
}

export function stringToFetch(value) {
  if (Utils.isType(value, 'String'))
    return Fetch(value);

  return value;
}
