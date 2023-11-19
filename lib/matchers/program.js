import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { ProcessMatcher } from './process.js';
import { stringToFetch }  from './fetch.js';

export const ProgramMatcher = Utils.makeKeysNonEnumerable(class ProgramMatcher extends ProcessMatcher {
  static [Utils.TYPE_SYMBOL] = 'ProgramMatcher';

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
});

export function Program(...matchers) {
  return new ProgramMatcher({
    matchers: matchers.map(stringToFetch).filter(Boolean),
  });
}
