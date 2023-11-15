import * as Utils       from '../utils.js';
import { Matcher }  from '../matcher.js';

export const NullMatcher = Utils.makeKeysNonEnumerable(class NullMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'NullMatcher';

  static name = 'Null';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};
    super(options);
  }

  exec(context) {
    context.debugLog('Null: Success.');
    return context.skipResult(0);
  }
});

export function Null() {
  return new NullMatcher();
}
