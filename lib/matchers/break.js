import * as Utils       from '../utils.js';
import { Matcher }  from '../matcher.js';

export const BreakMatcher = Utils.makeKeysNonEnumerable(class BreakMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'BreakMatcher';

  static name = 'Break';

  static isConsuming() {
    return false;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let target  = opts.target;

    super(opts);

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

  async exec(context) {
    return this.breakResult(context, this.target);
  }
});

export function Break(target) {
  return new BreakMatcher({ target });
}
