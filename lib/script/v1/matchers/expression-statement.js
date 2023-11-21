import { Matcher }      from '../../../matcher.js';
import { Token }        from '../../../token.js';
import { Program }      from '../../../matchers/program.js';
import { Switch }       from '../../../matchers/switch.js';
import { Literal }      from './literal.js';
import { Identifier }   from './identifier.js';
import { FunctionCall } from './function.js';
import { MapResult } from '../../../matchers/map-result.js';

export class ExpressionStatementToken extends Token {
  constructor(...args) {
    super(...args);

    Object.defineProperties(this, {
      'expression': {
        enumerable:   false,
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

export const ExpressionStatement = Matcher.createMatcherMethod((name) => {
  return MapResult(
    Program(
      Switch(
        Literal(),
        FunctionCall,
        Identifier(),
      ),
    ).name(name || 'ExpressionStatement'),
    ({ context }, result) => {
      let { token } = result;
      if (!token)
        return;

      return context.tokenResult(new ExpressionStatementToken(context, null, token), result);
    },
  );
});
