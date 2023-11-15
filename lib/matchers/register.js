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

  constructor(_options) {
    let options    = _options || {};
    let keyName = options.keyName;

    if (typeof keyName !== 'string')
      throw new TypeError('RegisterMatcher: "keyName" property is required.');

    super(options);

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
        value:        options.matcher || null,
      },
    });
  }

  async exec(context) {
    let keyName = context.resolveValue(this.keyName, { wantPrimitiveValue: true });
    if (!keyName)
      return context.panicResult('Register: Specified key to fetch from scope is empty.');

    let matcher = context.resolveValue(this.matcher);
    if (!(matcher instanceof Matcher))
      return context.panicResult('Register: Provided value is not a matcher.');

    context.assign({ [keyName]: matcher });

    return context.skipResult(0);
  }
});

export function Register(keyName, matcher) {
  return new RegisterMatcher({ keyName, matcher });
}
