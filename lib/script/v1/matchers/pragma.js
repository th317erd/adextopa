import { Matcher }        from '../../../matcher.js';
import * as CoreMatchers  from '../../../matchers/index.js';
import { WS1, MLWS0 }     from './whitespace.js';
import { Literal }        from './literal.js';

const {
  Discard,
  Equals,
  Loop,
  Matches,
  Optional,
  Program,
} = CoreMatchers;

export const Pragma = Matcher.createMatcherMethod(() => {
  return Program(
    Discard(Matches(/@pragma/)),
    Discard(WS1()),
    Matches(/\w+/).name('Name'),
    Discard(MLWS0()),
    Discard(Equals('(')),
    Discard(MLWS0()),
    Loop(
      Literal(),
      Discard(Optional(Matches(/[\s\n\r]*,[\s\r\n]*/))),
    ).name('Arguments'),
    Discard(MLWS0()),
    Discard(Equals(')')),
  ).name('PragmaStatement');
});
