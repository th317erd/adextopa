import { Matcher }  from '../matcher.js';

export class ContextMatcher extends Matcher {
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
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Updating context properties to: `, this.properties);
    context.assignToScope(this.properties);

    let matcher = this.resolveValue(context, this.matcher);
    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    return await matcher.run(context);
  }
}

export function Context(matcher, properties) {
  return new ContextMatcher({ matcher, properties });
}
