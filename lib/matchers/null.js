import * as Utils   from '../utils.js';
import { Matcher }  from '../matcher.js';

export const NullMatcher = Utils.makeKeysNonEnumerable(class NullMatcher extends Matcher {
  // static [Utils.TYPE_SYMBOL] = 'NullMatcher';

  static name = 'Null';

  static isConsuming() {
    return false;
  }

  exec(matcherScope) {
    let {
      context,
      matcherName,
      startOffset,
    } = matcherScope;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Success.`);

    return context.updateParserOffsetResult(startOffset);
  }
});

export const Null = Matcher.createMatcherMethod(() => {
  return new NullMatcher();
});
