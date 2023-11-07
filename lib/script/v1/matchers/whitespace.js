import {
  Matches,
} from '../../../matchers/matches.js';

export function WS0(name) {
  return Matches(name || 'Whitespace', /[^\S\n\r]*/);
}

export function WS1(name) {
  return Matches(name || 'Whitespace', /[^\S\n\r]+/);
}

export function WSN0(name) {
  return Matches(name || 'Whitespace', /\s*/);
}

export function WSN1(name) {
  return Matches(name || 'Whitespace', /\s+/);
}
