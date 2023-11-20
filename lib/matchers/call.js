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

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      keyName: ('' + context.resolveValue(this.keyName)),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      keyName,
    } = matcherScope;

    if (!keyName)
      return context.panicResult('Call: Specified key to fetch from scope is empty.');

    let matcher = context.resolveValue(context.fetch(keyName));
    if (!Utils.isType(matcher, 'Matcher', Matcher))
      return context.panicResult('Call: Resulting key value is not a matcher.');

    matcher = matcher.clone();
    if (this.hasCustomName)
      matcher = matcher.name(context.resolveValue(this.name()));

    return await context.exec(matcher);
  }
});

export function Call(keyName) {
  return new CallMatcher({ keyName });
}
