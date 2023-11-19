import {
  Matches,
} from '../../../matchers/matches.js';

export function Comment(name) {
  return Matches(/#[^\r\n]*(?:\r\n|\r|\n)/).name(name || 'Comment');
}
