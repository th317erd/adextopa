import { Matcher }  from '../matcher.js';

export class MapMatcher extends Matcher {
  static name = 'Map';

  constructor(_opts) {
    let opts          = _opts || {};
    let matcher       = opts.matcher;
    let resultMapper  = opts.resultMapper;

    if (!matcher)
      throw new TypeError('MapMatcher: "matcher" property is required.');

    if (typeof resultMapper !== 'function')
      throw new TypeError('MapMatcher: "resultMapper" property is required.');

    super(opts);

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
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));
    let matcher     = this.resolveValue(context, this.matcher);

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    return await matcher.run(context);
  }
}

export function Map(matcher, resultMapper) {
  return new MapMatcher({ matcher, resultMapper });
}
