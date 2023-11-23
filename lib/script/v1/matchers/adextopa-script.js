import { Matcher }        from '../../../matcher.js';
import * as CoreMatchers  from '../../../matchers/index.js';

import { EMPTY }  from './whitespace.js';
import { Pragma } from './pragma.js';

const {
  Loop,
  Program,
  Optional,
} = CoreMatchers;



export const AdextopaScript = Matcher.createMatcherMethod(() => {
  return Program(
    EMPTY,
    Optional(
      Loop(
        Pragma(),
        EMPTY,
      ).name('Pragmas'),
    ),
  );
});
