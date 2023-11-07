import { Matcher }  from '../matcher.js';

export class CallMatcher extends Matcher {
  static name = 'Call';

  constructor(_opts) {
    let opts    = _opts || {};
    let keyName = opts.keyName;

    if (typeof keyName !== 'string')
      throw new TypeError('CallMatcher: "keyName" property is required.');

    super({
      ...opts,
      consuming: true,
    });

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
    let keyName = this.resolveValue(context, this.keyName);
    if (!keyName)
      return this.errorResult(context, 'Call: Specified key to fetch from scope is empty.');

    let scope = context.scope;
    let matcher = this.resolveValue(context, scope.get(keyName));

    if (!(matcher instanceof Matcher))
      return this.errorResult(context, 'Call: Resulting key value is not a matcher.');

    matcher = matcher.clone();
    if (this.hasCustomName)
      matcher.name = this.resolveValue(context, this.name);

    return await matcher.run(context);
  }
}

export function Call(/* name?, keyName */) {
  if (arguments.length < 2)
    return new CallMatcher({ keyName: arguments[0] });
  else
    return new CallMatcher({ name: arguments[0], keyName: arguments[1] });
}
