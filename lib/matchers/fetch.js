import * as Utils                 from '../utils.js';
import { Token }                  from '../token.js';
import { Matcher }                from '../matcher.js';
import { MatcherResult }          from '../results/matcher-result.js';
import { PrimitiveMatcherResult } from '../results/primitive-matcher-result.js';

export const FetchMatcher = Utils.makeKeysNonEnumerable(class FetchMatcher extends Matcher {

  static name = 'Fetch';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};
    let keyName = options.keyName;

    super(options);

    Object.defineProperties(this, {
      'keyName': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        keyName,
      },
      'defaultValue': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        (options.defaultValue == null) ? null : options.defaultValue,
      },
    });
  }

  [Utils.VIRTUAL_RESOLVER](context, _options) {
    let options = _options || {};
    return context.fetch(this.keyName, options.defaultValue);
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      value: context.fetch(this.keyName),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      value,
      startOffset,
    } = matcherScope;

    if (Utils.isType(value, Token, 'Token'))
      return context.tokenResult(value);
    else if (Utils.isType(value, 'MatcherResult', MatcherResult))
      return value;

    return context.updateParserOffsetResult(startOffset, new PrimitiveMatcherResult({ context, value }));
  }
});

export const Fetch = Matcher.createMatcherMethod((_, keyName, defaultValue) => {
  return new FetchMatcher({ keyName, defaultValue });
});

export function stringToFetch(value) {
  if (Utils.isType(value, 'String'))
    return Fetch(value);

  return value;
}
