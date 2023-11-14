import * as Utils       from '../utils.js';
import { Matcher }  from '../matcher.js';

export const NullMatcher = Utils.makeKeysNonEnumerable(class NullMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'NullMatcher';

  static name = 'Null';

  static isConsuming() {
    return false;
  }

  constructor(_opts) {
    let opts = _opts || {};
    super(opts);
  }

  exec(context) {
    context.debugLog('Null: Success.');
    return this.skipResult(context, 0);
  }
});

export function Null() {
  return new NullMatcher();
}
