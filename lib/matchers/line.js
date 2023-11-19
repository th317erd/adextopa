import {
  Matches,
} from './matches.js';

export function Line(name) {
  return Matches(/[^\r\n]*(?:\r\n|\r|\n|$)/).name(name || 'Line');
}
