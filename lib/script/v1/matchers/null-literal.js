import { Matcher } from '../../../matcher.js';
import { Matches } from '../../../matchers/matches.js';

export const NullLiteral = Matcher.createMatcherMethod((name) => {
  return Matches(/\bnull\b/).name(name || 'NullLiteral');
});
