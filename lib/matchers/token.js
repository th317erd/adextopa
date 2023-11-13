import { Token as TokenType } from '../token.js';
import { Matcher }            from '../matcher.js';
import { ValueResolver }      from '../value-resolver.js';
import { MatcherResult }      from '../matcher-result.js';
import { SourceRange } from '../source-range.js';

export class TokenMatcher extends Matcher {
  static name = 'Token';

  static isConsuming() {
    return false;
  }

  isVirtual() {
    return true;
  }

  constructor(_opts) {
    let opts  = _opts || {};

    super(opts);

    Object.defineProperties(this, {
      'props': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.props || {},
      },
    });
  }

  [Matcher.VIRTUAL_RESOLVER](context, _opts) {
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));
    let range       = new SourceRange(context.range.start, context.range.start);
    let props       = this.resolveValue(context, this.props);

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

  async exec(context) {
    return this.tokenResult(
      context,
      this[Matcher.VIRTUAL_RESOLVER](context),
    );
  }
}

export function Token(name, props) {
  return new TokenMatcher({ name, props });
}
