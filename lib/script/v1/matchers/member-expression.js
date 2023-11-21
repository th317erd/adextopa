import { Matcher }              from '../../../matcher.js';
import { Token }                from '../../../token.js';

import {
  Equals,
  MapResult,
  Program,
  Skip,
  Switch,
} from '../../../matchers/index.js';

import { ExpressionStatement }  from './expression-statement.js';

export class MemberExpressionToken extends Token {
  constructor(...args) {
    super(...args);

    Object.defineProperties(this, {
      'object': {
        enumerable:   false,
        configurable: true,
        get:          () => {
          return this.children[0];
        },
      },
      'property': {
        enumerable:   false,
        configurable: true,
        get:          () => {
          return this.children[1];
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

export const MemberExpression = Matcher.createMatcherMethod((name) => {
  return MapResult(
    Program(
      ExpressionStatement,
      Switch(
        Program(
          Skip(Equals('.')),
          ExpressionStatement,
        ),
      ),
    ).name(name || 'MemberExpression'),
    ({ context }, result) => {
      let { token } = result;
      if (!token)
        return;

      return context.tokenResult(new MemberExpressionToken(context, null, token), result);
    },
  );
});
