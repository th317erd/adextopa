import {
  Matches,
} from '../../../matchers/matches.js';

import {
  MapResult,
} from '../../../matchers/map-result.js';

export function BooleanLiteral(name) {
  return MapResult(
    Matches(/\b(true|false)\b/).name(name || 'BooleanLiteral'),
    ({ result, token }) => {
      if (!token)
        return result;

      // Parse result into actual number,
      // and set it as the "value" property
      // of the token
      token.value((token.value === 'true'));

      return result;
    },
  );
}
