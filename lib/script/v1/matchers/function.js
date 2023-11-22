import { Matcher } from '../../../matcher.js';

import {
  Break,
  Discard,
  Equals,
  Loop,
  Optional,
  Program,
  ProxyChildren,
  Switch,
  Token,
} from '../../../matchers/index.js';

import { Whitespace }           from './whitespace.js';
import { ExpressionStatement }  from './expression-statement.js';
import { Identifier }           from './identifier.js';

const EMPTY = Whitespace()
  .newlines(true)
  .lineComments(true)
  .blockComments(true)
  .discardWhitespace(true);

export const FunctionArguments = Matcher.createMatcherMethod((_name) => {
  let name = _name || 'Arguments';

  return Program(
    Discard(Equals('(')),
    // Check for empty argument list
    Optional(
      Discard(
        Program(
          EMPTY,
          Discard(Equals(')')),
          // If we get this far, then we should stop
          Break(name),
        ),
      ),
    ),
    ProxyChildren(
      Loop(
        EMPTY,
        // Check for empty argument list
        Optional(
          Discard(
            Program(
              Discard(Equals(')')),
              // If we get this far, then we should stop
              Break(name),
            ),
          ),
        ),
        Switch(
          ExpressionStatement,
          Token({ value: 'null' }).name('NullLiteral'),
        ),
        EMPTY,
        Discard(Equals(',')),
      ).name('CaptureArguments'),
    ),
    Discard(Equals(')')),
  ).name(name);
});


export const FunctionCall = Matcher.createMatcherMethod((_name) => {
  let name = _name || 'FunctionCall';

  return Program(
    Identifier(),
    EMPTY,
    FunctionArguments(),
  ).name(name);
});
