import * as Utils       from '../utils.js';
import { FetchMatcher } from './fetch.js';

export const CastMatcher = Utils.makeKeysNonEnumerable(class CastMatcher extends FetchMatcher {
  static [Utils.TYPE_SYMBOL] = 'CastMatcher';

  static name = 'Cast';

  [Utils.VIRTUAL_RESOLVER](context, _options) {
    let options = _options || {};
    let type    = context.resolveValueToString(this.getOptions().type);
    let value   = this.getOptions().value;

    if (type === 'String')
      value = ('' + context.resolveValueToString(value, options));
    else if (type === 'Number')
      value = parseFloat(context.resolveValueToNumber(value, options));
    else if (type === 'Boolean')
      value = !!context.resolveValueToBoolean(value, options);
    else if (type === 'SourceRange')
      value = context.resolveValueToSourceRange(value, options);
    else
      value = context.resolveValue(value, options);

    return value;
  }
});

export const Cast = FetchMatcher.createMatcherMethod((_, type, value) => {
  return new CastMatcher({ type, value });
});
