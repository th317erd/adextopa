import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const TokenMatcherResult = Utils.makeKeysNonEnumerable(class TokenMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'TokenMatcherResult';

  constructor(value) {
    super(MatcherResult.STATUS_SUCCESS, value);
  }

  updateParserOffset(matcherScope, matcherResult, newOffset) {
    if (newOffset > matcherScope.context.parserRange.start)
      return super.updateParserOffset(matcherScope, matcherResult, newOffset);
  }

  async processChildren(matcherScope, matcherResult, token) {
    if (token.proxyChildren) {
      for (let child of token.children)
        await this.addChild(matcherScope, matcherResult, child);
    } else {
      await this.addChild(matcherScope, matcherResult, token);
    }
  }

  async process(matcherScope) {
    let token = this.value;

    await this.updateParserOffset(matcherScope, this, token.matchedRange.end);
    await this.processChildren(matcherScope, this, token);

    return await super.process(matcherScope);
  }
});
