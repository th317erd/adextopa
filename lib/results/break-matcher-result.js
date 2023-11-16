import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const BreakMatcherResult = Utils.makeKeysNonEnumerable(class BreakMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'BreakMatcherResult';

  constructor(value, target) {
    super(MatcherResult.RESULT_HALT, value);

    Object.defineProperties(this, {
      'target': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        target || null,
      },
    });
  }
});
