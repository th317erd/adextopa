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

import { Expression } from './expression.js';
import { Identifier } from './identifier.js';
import { MLWS0 } from './whitespace.js';

export function FunctionArguments(_name) {
  let name = _name || 'Arguments';

  return Program(
    Discard(Equals('(')),
    // Check for empty argument list
    Optional(
      Discard(
        Program(
          MLWS0(),
          Discard(Equals(')')),
          // If we get this far, then we should stop
          Break(name),
        ),
      ),
    ),
    ProxyChildren(
      Loop(
        MLWS0(),
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
          Expression,
          Token({ value: 'null' }).name('NullLiteral'),
        ),
        MLWS0(),
        Discard(Equals(',')),
      ).name('CaptureArguments'),
    ),
    Discard(Equals(')')),
  ).name(name);
}


export function FunctionCall(_name) {
  let name = _name || 'FunctionCall';

  return Program(
    Identifier(),
    MLWS0(),
    FunctionArguments(),
  ).name(name);
}
