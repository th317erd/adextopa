import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { stringToFetch }  from './fetch.js';

export const MapMatcher = Utils.makeKeysNonEnumerable(class MapMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'MapMatcher';

  static name = 'Map';

  constructor(_options) {
    let options   = _options || {};
    let matcher   = options.matcher;
    let mapMethod = options.mapMethod;

    if (!matcher)
      throw new TypeError('MapMatcher: "matcher" property is required.');

    if (typeof mapMethod !== 'function')
      throw new TypeError('MapMatcher: "mapMethod" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
      '_mapMethod': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        mapMethod,
      },
      '_tokensOnly': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        options.tokensOnly,
      },
    });
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher:    context.resolveValue(this.matcher),
      mapMethod:  this._mapMethod,
      tokensOnly: this._tokensOnly,
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcherName,
      matcher,
      mapMethod,
      tokensOnly,
    } = matcherScope;

    if (!Utils.isType(matcher, Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await context.exec(matcher);
    if (tokensOnly === true && !result.token)
      return result;

    return mapMethod.call(this, matcherScope, result.toObject());
  }
});

export function Map(matcher, mapMethod) {
  return new MapMatcher({
    matcher:    stringToFetch(matcher),
    mapMethod:  mapMethod,
  });
}

export function MapToken(matcher, mapMethod) {
  return new MapMatcher({
    matcher:    stringToFetch(matcher),
    mapMethod:  mapMethod,
    tokensOnly: true,
  });
}
