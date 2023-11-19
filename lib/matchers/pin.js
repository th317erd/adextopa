import * as Utils       from '../utils.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { ProgramMatcher } from './program.js';

export const PinMatcher = Utils.makeKeysNonEnumerable(class PinMatcher extends ProgramMatcher {
  static [Utils.TYPE_SYMBOL] = 'PinMatcher';

  static name = 'Pin';

  static isConsuming() {
    return false;
  }

  static hasOwnScope() {
    return false;
  }

  isConsuming() {
    return false;
  }

  // Help me!
  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher: context.resolveValue(this.matcher),
    };
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
      ProgramMatcher.PROCESS_CODE_BREAK,
      context.breakResult(matcherResult.value),
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
      ProgramMatcher.PROCESS_CODE_RESTART,
      context.continueResult(matcherResult.value),
    );
  }

  [MatcherResult.RESULT_TOKEN](scope, matcher, matcherResult) {
    let { context } = scope;
    let token = matcherResult.value;

    return this.createProcessResponse(
      scope,
      ProgramMatcher.PROCESS_CODE_NEXT,
      context.skipResult(token.matchedRange.end - context.parserRange.start),
    );
  }

  finalizeToken(scope) {
    return scope.context.skipResult(0);
  }
});

export function Pin(...matchers) {
  return new PinMatcher({ matchers });
}
