import { Token } from '../token.js';
import { Matcher }  from '../matcher.js';
import { ValueResolver } from '../value-resolver.js';
import { ProxyChildren } from './proxy-children.js';

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

  [Matcher.VIRTUAL_RESOLVER](context) {
    let valueResolver = new ValueResolver(context);
    return valueResolver.fetchProp(context, this.keyName, this.defaultValue);
  }

  async exec(context) {
    let value = this.resolveValue(context, this);
    if (value instanceof Token) {
      console.log('Fetch returned a value!', value);
      return this.tokenResult(context, value);
    }

    return this.skipResult(context, 0);
  }
}

export function Fetch(keyName, defaultValue) {
  return new FetchMatcher({ keyName, defaultValue });
}
