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
  return Matches(/[^\S\n\r]*/).name(name || 'Whitespace');
}

// Whitespace, but not newlines, one or more
export function WS1(name) {
  return Matches(/[^\S\n\r]+/).name(name || 'Whitespace');
}

// Whitespace, zero or more
export function WSN0(name) {
  return Matches(/\s*/).name(name || 'Whitespace');
}

// Whitespace, one or more
export function WSN1(name) {
  return Matches(/\s+/).name(name || 'Whitespace');
}

export function MLWS0() {
  return Optional(
    ProxyChildren(
      Loop(
        Switch(
          Discard(WSN0()),
          Optional(Comment()),
        ),
      ).name('WSLoop'),
    ),
  );
}

export function MLWS1() {
  return ProxyChildren(
    Loop(
      Switch(
        Optional(Discard(WSN1())),
        Optional(Comment()),
      ),
    ).name('WSLoop'),
  );
}
