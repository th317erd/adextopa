import {
  Sequence,
} from '../../../matchers/sequence.js';

export function String(name) {
  return Sequence(name || 'String', '\'', '\'', '\\');
}
