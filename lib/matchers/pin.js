import { MatcherResult }  from '../matcher-result.js';
import { ProgramMatcher } from './program.js';

export class PinMatcher extends ProgramMatcher {
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

  [MatcherResult.RESULT_BREAK](scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    if (!matcherResult.value)
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} breaking!`);
    else if (matcherResult.value === matcherName)
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} breaking because of a "break" request.`);
    else
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} breaking because a "break" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);

    return this.createProcessResponse(
      scope,
      ProgramMatcher.PROCESS_CODE_BREAK,
      matcherResult,
    );
  }

  [MatcherResult.RESULT_CONTINUE](scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    if (!matcherResult.value)
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} continuing!`);
    else if (matcherResult.value === matcherName)
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} continuing because of a "continue" request.`);
    else
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} continuing because a "continue" request is being passed upstream. Target: ${matcherResult.value || '<empty>'}`);

    return this.createProcessResponse(
      scope,
      ProgramMatcher.PROCESS_CODE_RESTART,
      matcherResult,
    );
  }

  [MatcherResult.RESULT_TOKEN](scope, matcher, matcherResult) {
    let { context } = scope;
    let token = matcherResult.value;

    return this.createProcessResponse(
      scope,
      ProgramMatcher.PROCESS_CODE_NEXT,
      this.skipResult(context, token.matchedRange.end - context.range.start),
    );
  }

  finalizeToken(scope) {
    return this.skipResult(scope.context, 0);
  }
}

export function Pin(...matchers) {
  return new PinMatcher({ matchers });
}
