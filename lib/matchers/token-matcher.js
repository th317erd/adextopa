import * as Utils             from '../utils.js';
import { Token as TokenType } from '../token.js';
import { Matcher }            from '../matcher.js';
import { SourceRange }        from '../source-range.js';

export const TokenMatcher = Utils.makeKeysNonEnumerable(class TokenMatcher extends Matcher {
  // static [Utils.TYPE_SYMBOL] = 'TokenMatcher';

  static name = 'Token';

  static isConsuming() {
    return false;
  }

  [Utils.VIRTUAL_RESOLVER](context, _options) {
    let matcherName = context.resolveValueToString(this.name());
    let range       = new SourceRange({ start: context.parserRange.start, end: context.parserRange.start });

    let resolvedAttributes = {};
    Utils.iterate(Utils.assign({}, this.attributes, (this.getOptions() || {}).attributes), (key, value) => {
      resolvedAttributes[key] = context.resolveValue(value);
    });

    return new TokenType({
      name:           matcherName,
      capturedRange:  range,
      matchedRange:   range.clone(),
      attributes:     resolvedAttributes,
      context,
    });
  }

  async exec(matcherScope) {
    return matcherScope.context.tokenResult(
      this[Utils.VIRTUAL_RESOLVER](matcherScope.context),
    );
  }
});

export const Token = Matcher.createMatcherMethod((_, attributes) => {
  return new TokenMatcher({ attributes });
});
