import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const HaltMatcherResult = Utils.makeKeysNonEnumerable(class HaltMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'HaltMatcherResult';

  constructor(value) {
    super(MatcherResult.STATUS_SUCCESS, value);
  }
});
