import { Matcher } from '../matcher.js';
import { Matches } from './matches.js';

export const Line = Matcher.createMatcherMethod((_, name) => {
  return Matches(/[^\r\n]*(?:\r\n|\r|\n|$)/).name(name || 'Line');
});
