import * as Utils   from '../../../utils.js';
import { Matcher }  from '../../../matcher.js';
import { Token }    from '../../../token.js';

import {
  Discard,
  Equals,
  MapResult,
  Program,
  ProxyChildren,
  Skip,
  Switch,
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
  return Switch(
    Program(
      Discard(Equals('.')),
      EMPTY,
      ExpressionStatement.literals(false),
    ).name(name || 'MemberExpression'),
    Program(
      Discard(Equals('[')),
      EMPTY,
      ExpressionStatement,
      EMPTY,
      Discard(Equals(']')),
    ).name(name || 'MemberExpression'),
  );
});
