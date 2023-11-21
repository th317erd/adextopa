import { Matcher } from '../../../matcher.js';

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
export const WS0 = Matcher.createMatcherMethod((name) => {
  return Matches(/[^\S\n\r]*/).name(name || 'Whitespace');
});

// Whitespace, but not newlines, one or more
export const WS1 = Matcher.createMatcherMethod((name) => {
  return Matches(/[^\S\n\r]+/).name(name || 'Whitespace');
});

// Whitespace, zero or more
export const WSN0 = Matcher.createMatcherMethod((name) => {
  return Matches(/\s*/).name(name || 'Whitespace');
});

// Whitespace, one or more
export const WSN1 = Matcher.createMatcherMethod((name) => {
  return Matches(/\s+/).name(name || 'Whitespace');
});

export const MLWS0 = Matcher.createMatcherMethod(() => {
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
});

export const MLWS1 = Matcher.createMatcherMethod(() => {
  return ProxyChildren(
    Loop(
      Switch(
        Optional(Discard(WSN1())),
        Optional(Comment()),
      ),
    ).name('WSLoop'),
  );
});
