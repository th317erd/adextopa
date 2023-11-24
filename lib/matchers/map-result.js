import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { stringToFetch }  from './fetch.js';

export const MapMatcher = Utils.makeKeysNonEnumerable(class MapMatcher extends Matcher {
  static name = 'MapResult';

  constructor(_options) {
    let options   = _options || {};
    let matcher   = options.matcher;
    let mapMethod = options.mapMethod;

    if (!Utils.isType(matcher, 'Matcher', Matcher))
      throw new TypeError('MapMatcher: "matcher" property is required.');

    if (typeof mapMethod !== 'function')
      throw new TypeError('MapMatcher: "mapMethod" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        matcher,
      },
      'mapMethod': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        mapMethod,
      },
      'tokensOnly': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        options.tokensOnly,
      },
    });
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      matcher:    context.resolveValueToMatcher(this.matcher),
      mapMethod:  context.resolveValue(this.mapMethod),
      tokensOnly: context.resolveValueToBoolean(this.tokensOnly),
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

    if (!Utils.isType(matcher, 'Matcher', Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let matcherResult = await context.exec(matcher);
    if (tokensOnly === true && !matcherResult.token) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Result is not a Token. Skipping callback and passing result upstream.`);
      return matcherResult;
    }

    let finalResult = await mapMethod.call(this, matcherScope, matcherResult);
    if (finalResult === undefined)
      finalResult = matcherResult;

    return finalResult;
  }
});

export const MapResult = Matcher.createMatcherMethod((_, matcher, mapMethod) => {
  return new MapMatcher({
    matcher:    stringToFetch(matcher),
    mapMethod:  mapMethod,
  });
});

export const MapToken = Matcher.createMatcherMethod((_, matcher, mapMethod) => {
  return new MapMatcher({
    matcher:    stringToFetch(matcher),
    mapMethod:  mapMethod,
    tokensOnly: true,
  });
});
