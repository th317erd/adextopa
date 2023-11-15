import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const TokenMatcherResult = Utils.makeKeysNonEnumerable(class TokenMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'TokenMatcherResult';

  constructor(value) {
    super(MatcherResult.STATUS_SUCCESS, value);
  }

  updateParserOffset(scope, matcherResult, newOffset) {
    if (newOffset > scope.context.parserRange.start)
      return super.updateParserOffset(scope, matcherResult, newOffset);
  }

  async processChildren(scope, matcherResult, token) {
    if (token.proxyChildren) {
      for (let child of token.children)
        await this.addChild(scope, matcherResult, child);
    } else {
      await this.addChild(scope, matcherResult, token);
    }
  }

  async process(scope) {
    let token = this.value;

    await this.updateParserOffset(scope, this, token.matchedRange.end);
    await this.processChildren(scope, this, token);

    return await super.process(scope);
  }
});
