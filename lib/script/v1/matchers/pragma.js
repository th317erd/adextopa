import * as CoreMatchers  from '../../../matchers/index.js';
import { WS0, WS1, MLWS0 } from './whitespace.js';
import { Literal }        from './literal.js';

const {
  Discard,
  Equals,
  Loop,
  Matches,
  Optional,
  Program,
} = CoreMatchers;

export function Pragma() {
  return Program('PragmaStatement',
    Discard(Matches(/@pragma/)),
    Discard(WS1()),
    Matches('Name', /\w+/),
    Discard(MLWS0()),
    Discard(Equals('(')),
    Discard(MLWS0()),
    Loop('Arguments',
      Literal(),
      Discard(Optional(Matches(/[\s\n\r]*,[\s\r\n]*/))),
    ),
    Discard(MLWS0()),
    Discard(Equals(')')),
  );
}
