import {
  Matches,
} from '../../../matchers/matches.js';

import {
  MapResult,
} from '../../../matchers/map-result.js';

export function NumberLiteral(name) {
  return MapResult(
    Matches(/[+-]?(?:\d+\.\d+e-\d+\b|\d+\.\d+\b|\d+\b(?!\.))/).name(name || 'NumberLiteral'),
    ({ result, token }) => {
      if (!token)
        return result;

      // Parse result into actual number,
      // and set it as the "value" property
      // of the token
      token.value(parseFloat(token.value));

      return result;
    },
  );
}
