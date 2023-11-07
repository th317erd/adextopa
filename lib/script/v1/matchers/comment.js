import {
  Matches,
} from '../../../matchers/matches.js';

export function Comment(name) {
  return Matches(name || 'Comment', /#[^\r\n]*(?:\r\n|\r|\n)/);
}
