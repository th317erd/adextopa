import {
  Matches,
} from '../../../matchers/matches.js';

import {
  Map,
} from '../../../matchers/map.js';

export function BooleanLiteral(name) {
  return Map(
    Matches(name || 'BooleanLiteral', /\b(true|false)\b/),
    ({ result, token }) => {
      if (!token)
        return result;

      // Parse result into actual number,
      // and set it as the "value" property
      // of the token
      token.value = (token.value === 'true');

      return result;
    },
  );
}
