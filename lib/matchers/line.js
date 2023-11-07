import {
  Matches,
} from './matches.js';

export function Line(name) {
  return Matches(name || 'Line', /[^\r\n]*(?:\r\n|\r|\n|$)/);
}
