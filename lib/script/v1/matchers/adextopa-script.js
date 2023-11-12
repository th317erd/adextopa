import * as CoreMatchers from '../../../matchers/index.js';

import {
  WSN0,
} from './whitespace.js';

import {
  Pragma,
} from './pragma.js';

const {
  Loop,
  Program,
  Skip,
  Optional,
} = CoreMatchers;

export function AdextopaScript() {
  return Program(
    Skip(WSN0()),
    Optional(
      Loop('Pragmas',
        Pragma(),
        Skip(WSN0()),
      ),
    ),
  );
}
