import * as Utils       from '../utils.js';
import { Matcher }  from '../matcher.js';

export const CallMatcher = Utils.makeKeysNonEnumerable(class CallMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'CallMatcher';

  static name = 'Call';

  constructor(_options) {
    let options = _options || {};
    let keyName = options.keyName;

    if (!Utils.isType(keyName, 'String', 'Function'))
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
    let matcherScope  = super.createMatcherScope(context);
    let keyName       = context.resolveValueToString(this.keyName);
    let matcher       = context.resolveValueToMatcherOrMethod(context.fetch(keyName)) || this.keyName;

    return {
      ...matcherScope,
      matcher,
      keyName,
    };
  }

  async exec(matcherScope) {
    let {
      context,
      keyName,
      matcher,
    } = matcherScope;

    if (!keyName)
      return context.panicResult('Call: Specified key to fetch from scope is empty.');

    if (!matcher)
      return context.panicResult('Call: Resulting key value is not a matcher.');

    if (Utils.isType(matcher, 'Function')) {
      return matcher.call(this, matcherScope);
    } else {
      matcher = matcher.clone();
      if (this.hasCustomName)
        matcher = matcher.name(context.resolveValueToString(this.name()));

      return await context.exec(matcher);
    }
  }
});

export const Call = Matcher.createMatcherMethod((keyName) => {
  return new CallMatcher({ keyName });
});
