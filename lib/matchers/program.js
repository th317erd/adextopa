import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { ProcessMatcher } from './process.js';
import { stringToFetch }  from './fetch.js';

export const ProgramMatcher = Utils.makeKeysNonEnumerable(class ProgramMatcher extends ProcessMatcher {
  static [Utils.TYPE_SYMBOL] = 'ProgramMatcher';

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

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} stopping because of a failure.`);

    return this.createProcessResponse(
      scope,
      ProcessMatcher.PROCESS_CODE_BREAK,
      matcherResult,
    );
  }
});

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
