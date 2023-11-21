import {
  Break,
  Discard,
  Equals,
  Loop,
  MapResult,
  Optional,
  Program,
  ProxyChildren,
  Switch,
  Token,
} from '../../../matchers/index.js';
import { Expression } from './expression.js';

import { Identifier } from './identifier.js';
import { MLWS0 } from './whitespace.js';

export function Arguments(_name) {
  let name = _name || 'Arguments';

  return MapResult(
    Program(
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
            Expression(),
            Token({ value: 'null' }).name('NullLiteral'),
          ),
          MLWS0(),
          Discard(Equals(',')),
        ).name('CaptureArguments'),
      ),
      Discard(Equals(')')),
    ).name(name),
    (_, { token }) => {
      if (!token)
        return;

      return;
    },
  );
}


export function FunctionCall(name) {
  return MapResult(
    Program(
      Identifier(),
      MLWS0(),
      Arguments(),
    ).name(name || 'FunctionCall'),
    (_, { token }) => {
      if (!token)
        return;

      return;
    },
  );
}
