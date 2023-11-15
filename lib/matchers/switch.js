import * as Utils         from '../utils.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { ProcessMatcher } from './process.js';
import { stringToFetch }  from './fetch.js';

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

  [MatcherResult.RESULT_FAIL](scope, _matcher, _matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} attempting next matcher...`);

    return this.createProcessResponse(
      scope,
      ProcessMatcher.PROCESS_CODE_NEXT,
    );
  }

  [MatcherResult.RESULT_BREAK](scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} breaking because a "break" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);

    return this.createProcessResponse(
      scope,
      ProcessMatcher.PROCESS_CODE_BREAK,
      matcherResult,
    );
  }

  [MatcherResult.RESULT_CONTINUE](scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} continuing because a "continue" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);

    return this.createProcessResponse(
      scope,
      ProcessMatcher.PROCESS_CODE_RESTART,
      matcherResult,
    );
  }

  [MatcherResult.RESULT_TOKEN](scope, matcher, matcherResult) {
    // let token = matcherResult.value;
    // if (token.parserRange.start === token.parserRange.end) {
    //   // If nothing was captured, then
    //   // skip instead, passing on this
    //   // token as the payload
    //   return this[MatcherResult.RESULT_SKIP](
    //     scope,
    //     matcher,
    //     this.skipResult(
    //       0,
    //       matcherResult,
    //     ),
    //   );
    // }

    return this.createProcessResponse(scope, ProcessMatcher.PROCESS_CODE_BREAK, matcherResult);
  }

  [MatcherResult.RESULT_SKIP](scope, matcher, matcherResult) {
    return this.createProcessResponse(
      scope,
      ProcessMatcher.PROCESS_CODE_NEXT,
      super[MatcherResult.RESULT_SKIP](scope, matcher, matcherResult).result,
    );
  }

  [MatcherResult.RESULT_SEEK](scope, matcher, matcherResult) {
    return this.createProcessResponse(scope, ProcessMatcher.PROCESS_CODE_NEXT, matcherResult);
  }

  finalizeToken(scope) {
    if (!this.isProcessSuccessful(scope))
      return;

    let {
      start,
      processToken,
    } = scope;

    return scope.context.skipResult(processToken.matchedRange.end - start);
  }
});

export function Switch(...matchers) {
  return new SwitchMatcher({ matchers: matchers.map(stringToFetch) });
}
