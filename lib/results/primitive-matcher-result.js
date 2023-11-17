import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const PrimitiveMatcherResult = Utils.makeKeysNonEnumerable(class PrimitiveMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'PrimitiveMatcherResult';

  constructor(context, parent, value) {
    super(context, parent);

    this.set(MatcherResult.VALUE, value);
  }
});
