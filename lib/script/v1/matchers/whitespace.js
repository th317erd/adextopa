import {
  Matches,
  Switch,
  Loop,
  Discard,
  ProxyChildren,
  Optional,
} from '../../../matchers/index.js';

import { Comment } from './comment.js';

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

export function MLWS0() {
  return Optional(
    ProxyChildren(
      Loop('WSLoop',
        Switch(
          Discard(WSN0()),
          Optional(Comment()),
        ),
      ),
    ),
  );
}

export function MLWS1() {
  return ProxyChildren(
    Loop('WSLoop',
      Switch(
        Optional(Discard(WSN1())),
        Optional(Comment()),
      ),
    ),
  );
}
