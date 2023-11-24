import * as Utils   from '../utils.js';
import { Matcher }  from '../matcher.js';

export const ContinueMatcher = Utils.makeKeysNonEnumerable(class ContinueMatcher extends Matcher {
  static name = 'Continue';

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
        enumerable:   true,
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
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Continuing from "${target}"!`);
    else
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Continuing!`);

    return context.result().setContinue(target || '');
  }
});

export const Continue = Matcher.createMatcherMethod((_, target) => {
  return new ContinueMatcher({ target });
});
