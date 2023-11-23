import { Matcher } from '../../../matcher.js';
import { Matches } from '../../../matchers/matches.js';

export const Identifier = Matcher.createMatcherMethod((_, name) => {
  return Matches(/[a-zA-Z$_@][a-zA-Z0-9$_@]*(?:\?(?=[^?]|$)|!(?=[^!]|$))?/).name(name || 'Identifier');
});
