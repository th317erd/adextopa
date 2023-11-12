import * as CoreMatchers  from '../../../matchers/index.js';
import { WS0, WS1, WSN0 } from './whitespace.js';
import { Literal }        from './literal.js';

const {
  Skip,
  Equals,
  Loop,
  Matches,
  Optional,
  Program,
} = CoreMatchers;

export function Pragma() {
  return Program('PragmaStatement',
    Skip(Matches(/@pragma/)),
    Skip(WS1()),
    Matches('Name', /\w+/),
    Skip(WS0()),
    Skip(Equals('(')),
    Skip(WSN0()),
    Loop('Arguments',
      Literal(),
      Skip(Optional(Matches(/[\s\n\r]*,[\s\r\n]*/))),
    ),
    Skip(WSN0()),
    Skip(Equals(')')),
  );
}
