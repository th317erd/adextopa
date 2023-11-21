import { Matcher }      from '../../../matcher.js';
import { Switch }       from '../../../matchers/switch.js';
import { Literal }      from './literal.js';
import { Identifier }   from './identifier.js';
import { FunctionCall } from './function.js';

export const Expression = Matcher.createMatcherMethod(() => {
  return Switch(
    Literal(),
    FunctionCall,
    Identifier(),
  );
});
