import * as Utils   from '../utils.js';
import { Matcher }  from '../matcher.js';

export const RegisterMatcher = Utils.makeKeysNonEnumerable(class RegisterMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'RegisterMatcher';

  static name = 'Register';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.matcher || null,
      },
    });
  }

  clone(options) {
    return super.clone({
      matcher: this.matcher,
      ...(options || {}),
    });
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher: context.resolveValue(this.matcher),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcherName,
      matcher,
      startOffset,
    } = matcherScope;

    if (!Utils.isType(matcher, 'Matcher', Matcher))
      return context.panicResult('Register: Provided value is not a matcher.');

    context.assign({ [matcherName]: matcher });

    return context.updateParserOffsetResult(startOffset);
  }
});

export function Register(name, matcher) {
  if (arguments.length < 2)
    return new RegisterMatcher({ matcher: name });
  else
    return new RegisterMatcher({ name, matcher });
}
