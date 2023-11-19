import * as Utils from '../utils.js';
import { Fetch }  from '../fetch.js';

export const PrimitiveMatcher = Utils.makeKeysNonEnumerable(class PrimitiveMatcher extends Fetch {
  static [Utils.TYPE_SYMBOL] = 'PrimitiveMatcher';

  static name = 'Primitive';

  [Utils.VIRTUAL_RESOLVER](context, _options) {
    let options = _options || {};
    return this.resolveValue(context.fetch(this.keyName, options.defaultValue), options);
  }

  // Help me!
  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher: context.resolveValue(this.matcher),
    };
  }
});

export function Primitive(keyName, defaultValue) {
  return new PrimitiveMatcher({ keyName, defaultValue });
}
