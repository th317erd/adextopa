import * as Utils   from '../utils.js';
import { Matcher }  from '../matcher.js';

export const ContinueMatcher = Utils.makeKeysNonEnumerable(class ContinueMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'ContinueMatcher';

  static name = 'Continue';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};
    let target  = options.target;

    super(options);

    Object.defineProperties(this, {
      'target': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        target || null,
      },
    });
  }

  getTarget() {
    return this.target;
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      target: ('' + context.resolveValue(this.matcher)),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      target,
    } = matcherScope;

    return context.result().setContinue(target);
  }
});

export function Continue(target) {
  return new ContinueMatcher({ target });
}
