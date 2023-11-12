import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../matcher-result.js';
import { LoopMatcher }    from './loop.js';
import { stringToFetch }  from './fetch.js';

export class ProgramMatcher extends LoopMatcher {
  static name = 'Program';

  constructor(_opts) {
    let opts = _opts || {};

    super({
      ...opts,
      startIndex: 0,
      endIndex:   1,
      step:       1,
    });
  }

  [MatcherResult.RESULT_FAIL](scope, matcher, matcherResult) {
    let {
      context,
      matcherName,
      typeName,
    } = scope;

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: ${typeName} stopping because of a failure.`);

    return this.createProcessResponse(
      scope,
      LoopMatcher.PROCESS_CODE_BREAK,
      matcherResult,
    );
  }
}

export function Program(/* name?, ...matchers */) {
  let args = Array.from(arguments);
  let name = args[0];

  if (typeof name === 'string' || Matcher.isVirtualMatcher(name))
    args = args.slice(1);
  else
    name = undefined;

  return new ProgramMatcher({
    name,
    matchers: args.map(stringToFetch),
  });
}
