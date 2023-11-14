import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const SkipMatcherResult = Utils.makeKeysNonEnumerable(class SkipMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'SkipMatcherResult';

  constructor(value) {
    super(MatcherResult.STATUS_SUCCESS, value);
  }
});
