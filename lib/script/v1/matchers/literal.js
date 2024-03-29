import { Matcher }        from '../../../matcher.js';
import { Switch }         from '../../../matchers/switch.js';
import { NullLiteral }    from './null-literal.js';
import { BooleanLiteral } from './boolean-literal.js';
import { NumberLiteral }  from './number-literal.js';
import { StringLiteral }  from './string-literal.js';
import { RegExpLiteral }  from './regexp-literal.js';

export const Literal = Matcher.createMatcherMethod(() => {
  return Switch(
    NullLiteral(),
    BooleanLiteral(),
    NumberLiteral(),
    StringLiteral(),
    RegExpLiteral(),
  );
});
