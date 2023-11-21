import { Matcher } from '../../../matcher.js';
import { Matches } from '../../../matchers/matches.js';

export const Comment = Matcher.createMatcherMethod((name) => {
  return Matches(/#[^\r\n]*(?:\r\n|\r|\n)/).name(name || 'Comment');
});
