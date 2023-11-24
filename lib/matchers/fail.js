import * as Utils   from '../utils.js';
import { Matcher }  from '../matcher.js';

export const FailMatcher = Utils.makeKeysNonEnumerable(class FailMatcher extends Matcher {
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

export const Fail = Matcher.createMatcherMethod(() => {
  return new FailMatcher();
});
