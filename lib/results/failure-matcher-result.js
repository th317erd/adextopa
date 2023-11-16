import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const FailureMatcherResult = Utils.makeKeysNonEnumerable(class FailureMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'FailureMatcherResult';

  constructor(value) {
    super(MatcherResult.RESULT_FAILED, value);
  }
});
