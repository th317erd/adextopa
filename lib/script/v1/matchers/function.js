import {
  Break,
  Discard,
  Equals,
  Loop,
  Map,
  Optional,
  Program,
  ProxyChildren,
  Skip,
  Switch,
  Token,
} from '../../../matchers/index.js';
import { Expression } from './expression.js';

import { Identifier } from './identifier.js';
import { MLWS0 } from './whitespace.js';

export function Arguments(name) {
  return Map(
    Program(name || 'Arguments',
      Discard(Equals('(')),
      // Check for empty argument list
      Optional(
        Discard(
          Program(
            MLWS0(),
            Discard(Equals(')')),
            // If we get this far, then we should stop
            Break('Arguments'),
          ),
        ),
      ),
      ProxyChildren(
        Loop('CaptureArguments',
          MLWS0(),
          // Check for empty argument list
          Optional(
            Discard(
              Program(
                Discard(Equals(')')),
                // If we get this far, then we should stop
                Break('CaptureArguments'),
              ),
            ),
          ),
          Switch(
            Expression(),
            Token('NullLiteral', { value: 'null' }),
          ),
          MLWS0(),
          Discard(Equals(',')),
        ),
      ),
      Discard(Equals(')')),
    ),
    ({ result, token }) => {
      if (!token)
        return result;

      return result;
    },
  );
}


export function FunctionCall(name) {
  return Map(
    Program(name || 'FunctionCall',
      Identifier(),
      MLWS0(),
      Arguments(),
    ),
    ({ result, token }) => {
      if (!token)
        return result;

      return result;
    },
  );
}
