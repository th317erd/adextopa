import { Switch }     from '../../../matchers/switch.js';
import { Literal }    from './literal.js';
import { Identifier } from './identifier.js';

export function Expression() {
  return Switch(
    Literal(),
    Identifier(),
  );
}
