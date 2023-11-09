import { MatcherResult }  from '../matcher-result.js';
import { LoopMatcher }    from './loop.js';

export class SwitchMatcher extends LoopMatcher {
  static name = 'Switch';

  static hasOwnScope() {
    return false;
  }

  constructor(_opts) {
    let opts = _opts || {};

    super({
      ...opts,
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

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} attempting next matcher...`);

    return this.createProcessResponse(
      scope,
      LoopMatcher.PROCESS_CODE_NEXT,
    );
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
      LoopMatcher.PROCESS_CODE_BREAK,
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
      LoopMatcher.PROCESS_CODE_RESTART,
      matcherResult,
    );
  }

  [MatcherResult.RESULT_TOKEN](scope, matcher, matcherResult) {
    return this.createProcessResponse(scope, LoopMatcher.PROCESS_CODE_BREAK, matcherResult);
  }

  [MatcherResult.RESULT_SKIP](scope, matcher, matcherResult) {
    return this.createProcessResponse(scope, LoopMatcher.PROCESS_CODE_BREAK, matcherResult);
  }

  [MatcherResult.RESULT_SEEK](scope, matcher, matcherResult) {
    return this.createProcessResponse(scope, LoopMatcher.PROCESS_CODE_BREAK, matcherResult);
  }
}

export function Switch(...matchers) {
  return new SwitchMatcher({ matchers: matchers });
}
