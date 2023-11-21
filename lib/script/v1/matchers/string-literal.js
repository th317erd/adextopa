import { Matcher }    from '../../../matcher.js';
import { MapResult }  from '../../../matchers/map-result.js';
import { Sequence }   from '../../../matchers/sequence.js';


export const StringLiteral = Matcher.createMatcherMethod((name) => {
  return MapResult(
    Sequence('\'', '\'', /\\\r\n|\\\r|\\\n|\\./).name(name || 'StringLiteral'),
    (_, { token }) => {
      if (!token)
        return;

      // Now convert the escaped characters
      token.value(
        token.value()
          .replace(/\\\r\n/g, '\r\n')
          .replace(/\\\r/g, '\r')
          .replace(/\\\n/g, '\n')
          .replace(/\\(.)/g, '$1'),
      );
    },
  );
});
