import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const PrimitiveMatcherResult = Utils.makeKeysNonEnumerable(class PrimitiveMatcherResult extends MatcherResult {
  // static [Utils.TYPE_SYMBOL] = 'PrimitiveMatcherResult';

  constructor(_options) {
    let options = _options || {};

    super(options);

    this.set(MatcherResult.VALUE, options.value);
  }
});
