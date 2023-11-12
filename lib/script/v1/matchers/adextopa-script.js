import * as CoreMatchers from '../../../matchers/index.js';

import {
  WSN0,
} from './whitespace.js';

const {
  Program,
  Discard,
} = CoreMatchers;

export function AdextopaScript() {
  return Program(
    Discard(WSN0()),
  );
}
