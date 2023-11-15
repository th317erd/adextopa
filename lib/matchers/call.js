import * as Utils       from '../utils.js';
import { Matcher }  from '../matcher.js';

export const CallMatcher = Utils.makeKeysNonEnumerable(class CallMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'CallMatcher';

  static name = 'Call';

  constructor(_options) {
    let options    = _options || {};
    let keyName = options.keyName;

    if (typeof keyName !== 'string')
      throw new TypeError('CallMatcher: "keyName" property is required.');

    super(options);

    Object.defineProperties(this, {
      'keyName': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        keyName,
      },
    });
  }

  async exec(context) {
    let keyName = context.resolveValue(this.keyName, { wantPrimitiveValue: true });
    if (!keyName)
      return context.panicResult('Call: Specified key to fetch from scope is empty.');

    let scope = context.scope;
    let matcher = context.resolveValue(scope.get(keyName));

    if (!(matcher instanceof Matcher))
      return context.panicResult('Call: Resulting key value is not a matcher.');

    matcher = matcher.clone();
    if (this.hasCustomName)
      matcher.name = context.resolveValue(this.name, { wantPrimitiveValue: true });

    return await context.exec(matcher);
  }
});

export function Call(/* name?, keyName */) {
  if (arguments.length < 2)
    return new CallMatcher({ keyName: arguments[0] });
  else
    return new CallMatcher({ name: arguments[0], keyName: arguments[1] });
}
