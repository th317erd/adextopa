import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const PanicMatcherResult = Utils.makeKeysNonEnumerable(class PanicMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'PanicMatcherResult';

  constructor(value) {
    super(MatcherResult.RESULT_FAILED, value);
  }
});
