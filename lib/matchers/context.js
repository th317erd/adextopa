import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { stringToFetch }  from './fetch.js';

export const ContextMatcher = Utils.makeKeysNonEnumerable(class ContextMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'ContextMatcher';

  static name = 'Context';

  static hasOwnScope() {
    return true;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!matcher)
      throw new TypeError('ContextMatcher: "matcher" property is required.');

    super(opts);

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

  async exec(context) {
    let matcherName = ('' + context.resolveValue(this.name, { wantPrimitiveValue: true }));

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Updating context properties to: `, this.properties);
    context.assignToScope(this.properties);

    let matcher = context.resolveValue(this.matcher);
    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    return await context.exec(matcher);
  }
});

export function Context(matcher, properties) {
  return new ContextMatcher({
    matcher: stringToFetch(matcher),
    properties,
  });
}
