import { Matcher }  from '../matcher.js';

export class RegisterMatcher extends Matcher {
  static name = 'Register';

  constructor(_opts) {
    let opts    = _opts || {};
    let keyName = opts.keyName;

    if (typeof keyName !== 'string')
      throw new TypeError('RegisterMatcher: "keyName" property is required.');

    super({
      ...opts,
      consuming: false,
    });

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
        value:        opts.value || null,
      },
    });
  }

  async exec(context) {
    let keyName = this.resolveValue(context, this.keyName);
    if (!keyName)
      return this.panicResult(context, 'Register: Specified key to fetch from scope is empty.');

    let scope = context.scope;
    let value = this.resolveValue(context, this.value);

    if (!(value instanceof Matcher))
      return this.panicResult(context, 'Register: Provided value is not a matcher.');

    scope.set(keyName, value);

    return this.skipResult(context, 0);
  }
}

export function Register(keyName, value) {
  return new RegisterMatcher({ keyName, value });
}
