import * as CoreMatchers from '../../../matchers/index.js';

import {
  MLWS0,
} from './whitespace.js';

import {
  Pragma,
} from './pragma.js';

const {
  Loop,
  Program,
  Discard,
  Optional,
} = CoreMatchers;

export function AdextopaScript() {
  return Program(
    Discard(MLWS0()),
    Optional(
      Loop('Pragmas',
        Pragma(),
        Discard(MLWS0()),
      ),
    ),
  );
}
