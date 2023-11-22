import { Matcher }        from '../../../matcher.js';
import * as CoreMatchers  from '../../../matchers/index.js';

import { Whitespace } from './whitespace.js';
import { Pragma }     from './pragma.js';

const {
  Loop,
  Program,
  Optional,
} = CoreMatchers;

const EMPTY = Whitespace()
  .newlines(true)
  .lineComments(true)
  .blockComments(true)
  .discardWhitespace(true);

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
