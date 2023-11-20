import * as Utils             from '../utils.js';
import { Token as TokenType } from '../token.js';
import { Matcher }            from '../matcher.js';
import { SourceRange }        from '../source-range.js';

export const TokenMatcher = Utils.makeKeysNonEnumerable(class TokenMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'TokenMatcher';

  static name = 'Token';

  static isConsuming() {
    return false;
  }

  [Utils.VIRTUAL_RESOLVER](context, _options) {
    let matcherName = ('' + context.resolveValue(this.name()));
    let range       = new SourceRange(context.parserRange.start, context.parserRange.start);

    let resolvedAttributes = {};
    Utils.iterate(Utils.assign({}, this.attributes, (this.getOptions() || {}).attributes), (key, value) => {
      resolvedAttributes[key] = context.resolveValue(value);
    });

    return new TokenType(context, null, {
      name:           matcherName,
      capturedRange:  range,
      matchedRange:   range.clone(),
      attributes:     resolvedAttributes,
    });
  }

  async exec(matcherScope) {
    return matcherScope.context.tokenResult(
      this[Utils.VIRTUAL_RESOLVER](matcherScope.context),
    );
  }
});

export function Token(attributes) {
  return new TokenMatcher({ attributes });
}
