import * as Utils         from '../utils.js';
import { Matcher }        from '../matcher.js';
import { ProcessMatcher } from './process.js';
import { stringToFetch }  from './fetch.js';

export const IterateMatcher = Utils.makeKeysNonEnumerable(class IterateMatcher extends ProcessMatcher {
  static [Utils.TYPE_SYMBOL] = 'IterateMatcher';

  static name = 'Iterate';

  // Attribute accessors
  start(value) {
    if (arguments.length === 0)
      return this.getAttribute('start');

    if (Utils.noe(value))
      throw new Error('Value can not be empty for "start" attribute.');

    if (!Utils.isValidNumber(+value) && !Utils.isType(value, 'Matcher', Matcher))
      throw new Error(`Invalid value for "start" attribute: ${value}`);

    this.setAttribute('start', value);

    return this;
  }

  end(value) {
    if (arguments.length === 0)
      return this.getAttribute('end');

    if (Utils.noe(value))
      throw new Error('Value can not be empty for "end" attribute.');

    if (!Utils.isValidNumber(+value) && !Utils.isType(value, 'Matcher', Matcher))
      throw new Error(`Invalid value for "end" attribute: ${value}`);

    this.setAttribute('end', value);

    return this;
  }

  step(value) {
    if (arguments.length === 0)
      return this.getAttribute('step');

    if (Utils.noe(value))
      throw new Error('Value can not be empty for "step" attribute.');

    if (!Utils.isValidNumber(+value) && !Utils.isType(value, 'Matcher', Matcher))
      throw new Error(`Invalid value for "step" attribute: ${value}`);

    this.setAttribute('step', value);

    return this;
  }
});

export const Iterate = Matcher.createMatcherMethod((_, ...matchers) => {
  return (new IterateMatcher({
    matchers:   matchers.map(stringToFetch).filter(Boolean),
    attributes: {
      start:  0,
      end:    Infinity,
      step:   1,
    },
  }));
}, [ 'start', 'end', 'step' ]);
