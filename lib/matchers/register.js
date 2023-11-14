import * as Utils       from '../utils.js';
import { Matcher }  from '../matcher.js';

export const RegisterMatcher = Utils.makeKeysNonEnumerable(class RegisterMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'RegisterMatcher';

  static name = 'Register';

  static isConsuming() {
    return false;
  }

  static skipLogging(...names) {
    return (names.indexOf('skip') >= 0);
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
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.matcher || null,
      },
    });
  }

  async exec(context) {
    let keyName = context.resolveValue(this.keyName, { wantPrimitiveValue: true });
    if (!keyName)
      return this.panicResult(context, 'Register: Specified key to fetch from scope is empty.');

    let matcher = context.resolveValue(this.matcher);
    if (!(matcher instanceof Matcher))
      return this.panicResult(context, 'Register: Provided value is not a matcher.');

    context.assignToScope({ [keyName]: matcher });

    return this.skipResult(context, 0);
  }
});

export function Register(keyName, matcher) {
  return new RegisterMatcher({ keyName, matcher });
}
