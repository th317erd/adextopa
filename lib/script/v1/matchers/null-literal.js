import {
  Matches,
} from '../../../matchers/matches.js';

export function NullLiteral(name) {
  return Matches(/\bnull\b/).name(name || 'NullLiteral');
}
