import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const ContinueMatcherResult = Utils.makeKeysNonEnumerable(class ContinueMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'ContinueMatcherResult';

  constructor(value, target) {
    super(MatcherResult.STATUS_STOP, value);

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
