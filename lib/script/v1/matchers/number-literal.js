import { Matcher }    from '../../../matcher.js';
import { Matches }    from '../../../matchers/matches.js';
import { MapResult }  from '../../../matchers/map-result.js';

export const NumberLiteral = Matcher.createMatcherMethod((_, name) => {
  return MapResult(
    Matches(/[+-]?(?:\d+\.\d+e-\d+\b|\d+\.\d+\b|\d+\b(?!\.))/).name(name || 'NumberLiteral'),
    (_, { token }) => {
      if (!token)
        return;

      // Parse result into actual number,
      // and set it as the "value" property
      // of the token
      token.value(parseFloat(token.value()));
    },
  );
});
