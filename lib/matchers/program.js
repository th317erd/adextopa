import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { ProcessMatcher } from './process.js';
import { stringToFetch }  from './fetch.js';

export const ProgramMatcher = Utils.makeKeysNonEnumerable(class ProgramMatcher extends ProcessMatcher {

  static name = 'Program';

  constructor(_options) {
    let options = _options || {};

    super({
      ...options,
      attributes: Utils.assign({}, options.attributes, {
        start:  0,
        end:    1,
        step:   1,
      }),
    });
  }

  async handleMatcherResult(matcherScope, matcherResult, onProcessEnded) {
    let {
      context,
      matcherName,
      typeName,
    } = matcherScope;

    if (matcherResult.failed) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: ${typeName} matcher failed! ${typeName} terminating!`);
      return matcherResult;
    }

    return await super.handleMatcherResult(matcherScope, matcherResult, onProcessEnded);
  }
});

export const Program = Matcher.createMatcherMethod((_, ...matchers) => {
  return new ProgramMatcher({
    matchers: matchers.map(stringToFetch).filter(Boolean),
  });
});
