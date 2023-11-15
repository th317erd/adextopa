import * as Utils         from '../utils.js';
import { MatcherResult }  from './matcher-result.js';

export const SkipMatcherResult = Utils.makeKeysNonEnumerable(class SkipMatcherResult extends MatcherResult {
  static [Utils.TYPE_SYMBOL] = 'SkipMatcherResult';

  constructor(value) {
    super(MatcherResult.STATUS_SUCCESS, value);
  }

  async process(scope) {
    let {
      context,
    } = scope;

    let offset = this.value;
    if (Utils.isValidNumber(offset) && offset !== 0)
      await this.updateParserOffset(scope, this, context.parserRange.start + offset);

    return await super.process(scope);
  }
});
