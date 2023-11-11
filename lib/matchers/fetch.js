import { Token }          from '../token.js';
import { Matcher }        from '../matcher.js';
import { ValueResolver }  from '../value-resolver.js';
import { MatcherResult }  from '../matcher-result.js';

export class FetchMatcher extends Matcher {
  static name = 'Fetch';

  static isConsuming() {
    return false;
  }

  isVirtual() {
    return true;
  }

  createFetchableScope(scopeProps) {
    let scope = Object.assign(Object.create(null), scopeProps || {});

    Object.defineProperties(scope, {
      'key': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        null,
      },
    });

    return scope;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let keyName = opts.keyName;

    if (typeof keyName !== 'string')
      throw new TypeError('FetchMatcher: "keyName" property is required.');

    super(opts);

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
        value:        (opts.defaultValue == null) ? null : opts.defaultValue,
      },
    });
  }

  [Matcher.VIRTUAL_RESOLVER](context, _opts) {
    let opts          = Object.assign(Object.create(_opts || null), { defaultValue: this.defaultValue });
    let valueResolver = new ValueResolver(context, 'Fetch', opts);
    return valueResolver.fetchProp(context, this.keyName, opts);
  }

  async exec(context) {
    let value = this.resolveValue(context, this, { wantPrimitiveValue: false });
    if (value instanceof Token)
      return this.tokenResult(context, value);
    else if (value instanceof MatcherResult)
      return value;

    return this.skipResult(context, 0);
  }
}

export function Fetch(keyName, defaultValue) {
  return new FetchMatcher({ keyName, defaultValue });
}

export function stringToFetch(value) {
  if (typeof value === 'string' || (value instanceof String))
    return Fetch(value);

  return value;
}
