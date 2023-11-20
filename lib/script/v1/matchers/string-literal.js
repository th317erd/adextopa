import {
  Sequence,
} from '../../../matchers/sequence.js';

import {
  MapResult,
} from '../../../matchers/map-result.js';

export function StringLiteral(name) {
  return MapResult(
    Sequence(name || 'StringLiteral', '\'', '\'', /\\\r\n|\\\r|\\\n|\\./),
    ({ result, token }) => {
      if (!token)
        return result;

      // Now convert the escaped characters
      token.value = token.value
        .replace(/\\\r\n/g, '\r\n')
        .replace(/\\\r/g, '\r')
        .replace(/\\\n/g, '\n')
        .replace(/\\(.)/g, '$1');

      return result;
    },
  );
}
