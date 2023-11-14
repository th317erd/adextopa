import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const TokenMatcherResult = Utils.makeKeysNonEnumerable(class TokenMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'TokenMatcherResult';

  constructor(value) {
    super(MatcherResult.STATUS_SUCCESS, value);
  }

  process(context) {
    let token = this.value;
    if (token.matchedRange.end > context.parserRange.start)
      context.parserRange.start = token.matchedRange.end;
  }
});
