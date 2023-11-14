import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const TokenMatcherResult = Utils.makeKeysNonEnumerable(class TokenMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'TokenMatcherResult';

  constructor(value) {
    super(MatcherResult.STATUS_SUCCESS, value);
  }

  process(context, parentToken) {
    let token = this.value;
    if (token.matchedRange.end > context.parserRange.start)
      context.parserRange.start = token.matchedRange.end;

    if (token.proxyChildren) {
      for (let child of token.children)
        parentToken.addChild(child);
    } else {
      parentToken.addChild(token);
    }
  }
});
