import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { Token }          from '../token.js';
import { MatcherResult }  from '../results/matcher-result.js';

export const CastMatcher = Utils.makeKeysNonEnumerable(class CastMatcher extends Matcher {

  static name = 'Cast';

  constructor(_options) {
    let options = _options || {};
    let type    = options.type;

    super(options);

    Object.defineProperties(this, {
      'type': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        type,
      },
      'value': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        options.value,
      },
    });
  }

  castValue(matcherScope, type, value) {
    let {
      context,
    } = matcherScope;

    if (type === 'String')
      return ('' + context.resolveValueToString(value));
    else if (type === 'Number')
      return parseFloat(context.resolveValueToNumber(value));
    else if (type === 'Boolean')
      return !!context.resolveValueToBoolean(value);
    else if (type === 'BigInt')
      return BigInt(value);
    else if (type === 'SourceRange')
      return context.resolveValueToSourceRange(value);
    else if (typeof type === 'function')
      return new type(value); // Cast to a class
    else
      return value;
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      type:   context.resolveValue(this.type),
      value:  context.resolveValue(this.value),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      type,
      value,
      startOffset,
    } = matcherScope;

    if (Utils.isType(value, Matcher, 'Matcher'))
      value = await context.exec(value);

    if (Utils.isType(value, MatcherResult, 'MatcherResult')) {
      if (!value.isSuccessful())
        return value; // Failed matcher result

      if (value.token)
        value = value.token;
      else
        value = value.value; // raw value
    }

    value = this.castValue(matcherScope, type, value);

    if (Utils.isType(value, Token, 'Token'))
      return context.tokenResult(value);
    else if (Utils.isType(value, 'MatcherResult', MatcherResult))
      return value;

    return context.updateParserOffsetResult(startOffset, context.result().setValue(value));
  }
});

export const Cast = Matcher.createMatcherMethod((_, type, value) => {
  return new CastMatcher({ type, value });
});
