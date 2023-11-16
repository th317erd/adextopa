import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const SkipMatcherResult = Utils.makeKeysNonEnumerable(class SkipMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'SkipMatcherResult';

  constructor(value) {
    super(MatcherResult.RESULT_TOKEN, value);
  }

  async process(matcherScope) {
    let {
      context,
    } = matcherScope;

    let offset = this.value;
    if (Utils.isValidNumber(offset) && offset !== 0)
      await this.updateParserOffset(matcherScope, this, context.parserRange.start + offset);

    return await super.process(matcherScope);
  }
});
