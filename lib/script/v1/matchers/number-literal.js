import {
  Matches,
} from '../../../matchers/matches.js';

import {
  Map,
} from '../../../matchers/map.js';

export function NumberLiteral(name) {
  return Map(
    Matches(name || 'NumberLiteral', /[+-]?(?:\d+\.\d+e-\d+\b|\d+\.\d+\b|\d+\b(?!\.))/),
    ({ result, token }) => {
      if (!token)
        return result;

      // Parse result into actual number,
      // and set it as the "value" property
      // of the token
      token.value = parseFloat(token.value);

      return result;
    },
  );
}
