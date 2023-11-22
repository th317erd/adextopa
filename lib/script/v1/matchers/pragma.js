import { Matcher }        from '../../../matcher.js';
import * as CoreMatchers  from '../../../matchers/index.js';
import { Whitespace }     from './whitespace.js';
import { Literal }        from './literal.js';

const {
  Discard,
  Equals,
  Loop,
  Matches,
  Optional,
  Program,
} = CoreMatchers;

const EMPTY = Whitespace()
  .newlines(true)
  .lineComments(true)
  .blockComments(true)
  .discardWhitespace(true);

export const Pragma = Matcher.createMatcherMethod(() => {
  return Program(
    Discard(Matches(/@pragma/)),
    Whitespace().blockComments(true).discardWhitespace(true),
    Matches(/\w+/).name('Name'),
    EMPTY,
    Discard(Equals('(')),
    EMPTY,
    Loop(
      Literal(),
      Discard(Optional(Matches(/[\s\n\r]*,[\s\r\n]*/))),
    ).name('Arguments'),
    EMPTY,
    Discard(Equals(')')),
  ).name('PragmaStatement');
});
