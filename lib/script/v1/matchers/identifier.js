import {
  Matches,
} from '../../../matchers/matches.js';

export function Identifier(name) {
  return Matches(name || 'Identifier', /[a-zA-Z$_@][a-zA-Z0-9$_@]*/);
}
