import {
  Matches,
} from '../../../matchers/matches.js';

export function Identifier(name) {
  return Matches(/[a-zA-Z$_@][a-zA-Z0-9$_@]*(?:\?(?=[^?]|$)|!(?=[^!]|$))?/).name(name || 'Identifier');
}
