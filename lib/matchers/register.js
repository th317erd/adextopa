import { Matcher }  from '../matcher.js';

export class RegisterMatcher extends Matcher {
  static name = 'Register';

  static isConsuming() {
    return false;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let keyName = opts.keyName;

    if (typeof keyName !== 'string')
      throw new TypeError('RegisterMatcher: "keyName" property is required.');

    super(opts);

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

    let value = this.resolveValue(context, this.value);
    if (!(value instanceof Matcher))
      return this.panicResult(context, 'Register: Provided value is not a matcher.');

    context.assignToScope({ [keyName]: value });

    return this.skipResult(context, 0);
  }
}

export function Register(keyName, value) {
  return new RegisterMatcher({ keyName, value });
}
