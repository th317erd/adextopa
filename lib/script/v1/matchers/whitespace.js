import {
  Matches,
} from '../../../matchers/matches.js';

// Whitespace, but not newlines, zero or more
export function WS0(name) {
  return Matches(name || 'Whitespace', /[^\S\n\r]*/);
}

// Whitespace, but not newlines, one or more
export function WS1(name) {
  return Matches(name || 'Whitespace', /[^\S\n\r]+/);
}

// Whitespace, zero or more
export function WSN0(name) {
  return Matches(name || 'Whitespace', /\s*/);
}

// Whitespace, one or more
export function WSN1(name) {
  return Matches(name || 'Whitespace', /\s+/);
}
