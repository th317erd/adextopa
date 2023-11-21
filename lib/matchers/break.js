import * as Utils   from '../utils.js';
import { Matcher }  from '../matcher.js';

export const BreakMatcher = Utils.makeKeysNonEnumerable(class BreakMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'BreakMatcher';

  static name = 'Break';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options = _options || {};
    let target  = options.target;

    super(options);

    Object.defineProperties(this, {
      'target': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        target || '',
      },
    });
  }

  getTarget() {
    return this.target;
  }

  createMatcherScope(context) {
    let matcherScope = super.createMatcherScope(context);

    return {
      ...matcherScope,
      target: context.resolveValueToString(this.target),
    };
  }

  async exec(matcherScope) {
    let {
      context,
      matcherName,
      target,
    } = matcherScope;

    if (target)
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Breaking from "${target}"!`);
    else
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Breaking!`);

    return context.result().setBreak(target || '');
  }
});

export const Break = Matcher.createMatcherMethod((target) => {
  return new BreakMatcher({ target });
});
