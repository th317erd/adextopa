import { Switch }         from '../../../matchers/switch.js';
import { BooleanLiteral } from './boolean-literal.js';
import { NumberLiteral }  from './number-literal.js';
import { StringLiteral }  from './string-literal.js';

export function Literal() {
  return Switch(
    BooleanLiteral(),
    NumberLiteral(),
    StringLiteral(),
  );
}
