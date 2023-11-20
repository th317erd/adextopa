import * as Utils   from '../utils.js';
import { Matcher }  from '../matcher.js';

export const FailMatcher = Utils.makeKeysNonEnumerable(class FailMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'FailMatcher';

  static name = 'Fail';

  static isConsuming() {
    return false;
  }

  exec(matcherScope) {
    let {
      context,
      matcherName,
    } = matcherScope;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Failing as requested...`);

    return context.failResult();
  }
});

export function Fail() {
  return new FailMatcher();
}
