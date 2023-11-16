import * as Utils         from '../utils.js';
import { ProcessMatcher } from './process.js';
import { stringToFetch }  from './fetch.js';
import { MatcherResult }  from '../results/matcher-result.js';

export const SwitchMatcher = Utils.makeKeysNonEnumerable(class SwitchMatcher extends ProcessMatcher {
  static [Utils.TYPE_SYMBOL] = 'SwitchMatcher';

  static name = 'Switch';

  static hasOwnScope() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};

    super({
      ...options,
      startIndex: 0,
      endIndex:   1,
      step:       1,
    });
  }

  // For "Switch" we skip to next matcher
  // on Failure, instead of aborting
  async handleMatcherResult(matcherScope, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = matcherScope;

    // First, handle important messages
    if (matcherResult.get(MatcherResult.PANIC)) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} failed because of a panic! Passing "panic" upstream...`);
      return matcherResult;
    } else if (matcherResult.get(MatcherResult.FAILED)) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} matcher failed! Attempting next matcher...`);

      // Apply the result to "processToken"
      await this.applyMatcherResult(matcherScope, matcherResult);

      return await this.nextMatcher(matcherScope);
    } else if (matcherResult.get(MatcherResult.HALT)) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} halt request received! Passing "halt" upstream...`);
    }

    // Apply the result to "processToken"
    await this.applyMatcherResult(matcherScope, matcherResult);

    return matcherResult;
  }
});

export function Switch(...matchers) {
  return new SwitchMatcher({
    matchers: matchers.map(stringToFetch).filter(Boolean),
  });
}
