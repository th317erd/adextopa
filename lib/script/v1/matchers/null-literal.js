import {
  Matches,
} from '../../../matchers/matches.js';

export function NullLiteral(name) {
  return Matches(name || 'NullLiteral', /\bnull\b/);
}
