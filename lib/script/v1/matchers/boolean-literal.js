import { Matcher }    from '../../../matcher.js';
import { Matches }    from '../../../matchers/matches.js';
import { MapResult }  from '../../../matchers/map-result.js';

export const BooleanLiteral = Matcher.createMatcherMethod((name) => {
  return MapResult(
    Matches(/\b(?:true|false)\b/).name(name || 'BooleanLiteral'),
    (_, { token }) => {
      if (!token)
        return;

      // Parse result into actual number,
      // and set it as the "value" property
      // of the token
      token.value((token.value() === 'true'));
    },
  );
});
