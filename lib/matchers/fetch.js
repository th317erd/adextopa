import { Matcher }  from '../matcher.js';

export class FetchMatcher extends Matcher {
  static name = 'Fetch';

  constructor(_opts) {
    let opts    = _opts || {};
    let keyName = opts.keyName;

    if (typeof keyName !== 'string')
      throw new TypeError('FetchMatcher: "keyName" property is required.');

    super({
      ...opts,
      consuming: false,
    });

    Object.defineProperties(this, {
      '_isFetchMatcher': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        true,
      },
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
        value:        opts.defaultValue,
      },
    });
  }

  fetchValue(context) {
    let keyName = this.resolveValue(context, this.keyName);
    if (!keyName)
      return this.panicResult(context, 'Fetch: Specified key to fetch from scope is empty.');

    let keyNameParts    = keyName.split('.');
    let primaryKeyName  = keyNameParts[0];
    let defaultValue    = this.resolveValue(context, this.defaultValue);
    let scope           = context.scope;

    if (defaultValue === undefined)
      defaultValue = null;

    if (scope.has(primaryKeyName)) {
      let value = scope.get(primaryKeyName);
      if (value == null)
        return defaultValue;

      if (value && keyNameParts.length > 1) {
        for (let i = 1, il = keyNameParts.length; i < il; i++) {
          let part = keyNameParts[i];
          if (typeof value.fetchProp === 'function')
            value = value.fetchProp(context, part);
          else
            value = null;

          if (value == null)
            return defaultValue;
        }
      }

      if (value && typeof value.fetchProp === 'function')
        value = value.fetchProp(context, '$default');

      return (value == null) ? defaultValue : value;
    } else {
      return defaultValue;
    }
  }

  async exec(context) {
    return this.skipResult(context, 0);
  }
}

export function Fetch(keyName, defaultValue) {
  return new FetchMatcher({ keyName, defaultValue });
}
