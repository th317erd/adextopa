import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { stringToFetch }  from './fetch.js';

export const MapMatcher = Utils.makeKeysNonEnumerable(class MapMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'MapMatcher';

  static name = 'Map';

  constructor(_options) {
    let options          = _options || {};
    let matcher       = options.matcher;
    let resultMapper  = options.resultMapper;

    if (!matcher)
      throw new TypeError('MapMatcher: "matcher" property is required.');

    if (typeof resultMapper !== 'function')
      throw new TypeError('MapMatcher: "resultMapper" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
      '_resultMapper': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        resultMapper,
      },
    });
  }

  async exec(context) {
    let matcherName = ('' + context.resolveValue(this.name, { wantPrimitiveValue: true }));
    let matcher     = context.resolveValue(this.matcher);

    if (!(matcher instanceof Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    return await context.exec(matcher);
  }
});

export function Map(matcher, resultMapper) {
  return new MapMatcher({
    matcher: stringToFetch(matcher),
    resultMapper,
  });
}
