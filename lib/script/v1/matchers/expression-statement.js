import * as Utils       from '../../../utils.js';
import { Matcher }      from '../../../matcher.js';
import { Token }        from '../../../token.js';
import { SourceRange }  from '../../../source-range.js';

import {
  MapResult,
  Optional,
  Program,
  Switch,
  Store,
} from '../../../matchers/index.js';

import { EMPTY }            from './whitespace.js';
import { Literal }          from './literal.js';
import { Identifier }       from './identifier.js';
import { FunctionCall }     from './function.js';
import { MemberExpression, MemberExpressionToken } from './member-expression.js';

export class ExpressionStatementToken extends Token {

  constructor(options) {
    super(options);

    Object.defineProperties(this, {
      'expression': {
        enumerable:   true,
        configurable: true,
        get:          () => {
          return this.children[0];
        },
      },
    });
  }

  toJSON(...args) {
    let obj = super.toJSON(...args);

    delete obj.children;

    return {
      ...obj,
      expression: this.expression,
    };
  }
}

export const ExpressionStatement = Matcher.createMatcherMethod(({ name, literals, functionCalls, identifiers, memberExpression }) => {
  return MapResult(
    Program(
      Store('PreviousExpression',
        Switch(
          (literals !== false && Literal()),
          (functionCalls !== false) && FunctionCall,
          (identifiers !== false) && Identifier(),
        ),
      ),
      EMPTY,
      (memberExpression !== false) && Optional(MemberExpression),
    ).name(name || 'ExpressionStatement'),
    ({ context }, result) => {
      let { token } = result;
      if (!token)
        return;

      let expressionToken = new ExpressionStatementToken(token);
      return context.tokenResult(expressionToken, result);
    },
  );
}, [ 'literals', 'functionCalls', 'identifiers', 'memberExpression' ]);
