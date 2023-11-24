import * as Utils   from '../../../utils.js';
import { Matcher }  from '../../../matcher.js';
import { Token }    from '../../../token.js';

import {
  Discard,
  Equals,
  Fetch,
  IfNot,
  MapResult,
  Panic,
  Program,
  ProxyChildren,
  Skip,
  Switch,
  Store,
  Loop,
} from '../../../matchers/index.js';

import { EMPTY }                from './whitespace.js';
import { ExpressionStatement }  from './expression-statement.js';

export class MemberExpressionToken extends Token {
  static [Utils.TYPE_SYMBOL] = 'MemberExpressionToken';

  constructor(options) {
    super(options);

    Object.defineProperties(this, {
      'object': {
        enumerable:   true,
        configurable: true,
        get:          () => {
          return this.children[0];
        },
      },
      'property': {
        enumerable:   true,
        configurable: true,
        get:          () => {
          let property = this.children[1];
          if (property.name() === 'ExpressionStatement')
            return property.expression;

          return property;
        },
      },
    });
  }

  toJSON(...args) {
    let obj = super.toJSON(...args);

    delete obj.children;

    return {
      ...obj,
      object:   this.object,
      property: this.property,
    };
  }
}

export const MemberExpression = Matcher.createMatcherMethod(({ name }) => {
  return ProxyChildren(Loop(
    Store('PreviousExpression',
      MapResult(
        Program(
          IfNot(Fetch('PreviousExpression')).Then(
            Panic('Unexpected token'),
          ).Else(
            Fetch('PreviousExpression'),
          ),
          ProxyChildren(
            Switch(
              Program(
                Discard(Equals('.')),
                EMPTY,
                ExpressionStatement.literals(false).memberExpression(false),
              ),
              Program(
                Discard(Equals('[')),
                EMPTY,
                ExpressionStatement.memberExpression(false),
                EMPTY,
                Discard(Equals(']')),
              ),
            ),
          ),
        ).name(name || 'MemberExpression'),
        ({ context }, result) => {
          let { token } = result;
          if (!token)
            return;

          let memberExpressionToken = new MemberExpressionToken(token);
          return context.tokenResult(memberExpressionToken, result);
        },
      ),
    ),
  ));
});
