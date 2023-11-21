import { Switch }       from '../../../matchers/switch.js';
import { Literal }      from './literal.js';
import { Identifier }   from './identifier.js';
import { FunctionCall } from './function.js';

export function Expression() {
  return Switch(
    Literal(),
    FunctionCall,
    Identifier(),
  );
}
