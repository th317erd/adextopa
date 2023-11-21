import { Matcher }        from '../../../matcher.js';
import * as CoreMatchers  from '../../../matchers/index.js';

import { MLWS0 }  from './whitespace.js';
import { Pragma } from './pragma.js';

const {
  Loop,
  Program,
  Discard,
  Optional,
} = CoreMatchers;

export const AdextopaScript = Matcher.createMatcherMethod(() => {
  return Program(
    Discard(MLWS0()),
    Optional(
      Loop(
        Pragma(),
        Discard(MLWS0()),
      ).name('Pragmas'),
    ),
  );
});
