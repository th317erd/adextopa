import * as Utils       from '../utils.js';
import { Token as TokenType } from '../token.js';
import { Matcher }            from '../matcher.js';
import { SourceRange }        from '../source-range.js';

export const TokenMatcher = Utils.makeKeysNonEnumerable(class TokenMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'TokenMatcher';

  static name = 'Token';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options  = _options || {};

    super(options);

    Object.defineProperties(this, {
      'props': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.props || {},
      },
    });
  }

  [Utils.VIRTUAL_RESOLVER](context, _options) {
    let matcherName = ('' + context.resolveValue(this.name, { wantPrimitiveValue: true }));
    let range       = new SourceRange(context.parserRange.start, context.parserRange.start);
    let props       = context.resolveValue(this.props);

    return new TokenType(context, {
      name:           matcherName,
      capturedRange:  range,
      capturedValue:  (props.value || ''),
      matchedRange:   range.clone(),
      matchedValue:   (props.value || ''),
      value:          (props.value || ''),
      ...props,
    });
  }

  async exec(matcherScope) {
    return context.tokenResult(this[Matcher.VIRTUAL_RESOLVER](context));
  }
});

export function Token(name, props) {
  return new TokenMatcher({ name, props });
}
