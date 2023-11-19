import * as Utils       from '../utils.js';
import { Matcher }  from '../matcher.js';

export const BreakMatcher = Utils.makeKeysNonEnumerable(class BreakMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'BreakMatcher';

  static name = 'Break';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options    = _options || {};
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

  // Help me!
  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher: context.resolveValue(this.matcher),
    };
  }

  async exec(matcherScope) {
    return context.breakResult(this.target);
  }
});

export function Break(target) {
  return new BreakMatcher({ target });
}
