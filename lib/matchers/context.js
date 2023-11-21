import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { stringToFetch }  from './fetch.js';

export const ContextMatcher = Utils.makeKeysNonEnumerable(class ContextMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'ContextMatcher';

  static name = 'Context';

  static hasOwnScope() {
    return true;
  }

  constructor(_options) {
    let options = _options || {};
    let matcher = options.matcher;

    if (!matcher)
      throw new TypeError('ContextMatcher: "matcher" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
      'properties': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        this.getOptions().properties || {},
      },
    });
  }

  async exec(matcherScope) {
    let {
      context,
      matcherName,
    } = matcherScope;


    context.assign(this.properties);
    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Updating context to: `, context.getProperties());

    let matcher = context.resolveValueToMatcher(this.matcher);
    if (!matcher)
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    return await context.exec(matcher);
  }
});

export const Context = Matcher.createMatcherMethod((matcher, properties) => {
  return new ContextMatcher({
    matcher: stringToFetch(matcher),
    properties,
  });
});
