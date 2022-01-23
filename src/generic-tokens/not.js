const { isType }        = require('../utils');
const { defineMatcher } = require('../matcher-definition');

const $NOT = defineMatcher('$NOT', (ParentClass) => {
  return class NotMatcher extends ParentClass {
    constructor(matcher, opts) {
      super(opts);

      this.setMatcher(matcher);
    }

    setMatcher(matcher) {
      if (!isType(matcher, 'MatcherDefinition'))
        throw new TypeError('$NOT::setMatcher: First argument must be instance of `MatcherDefinition`');

      Object.defineProperty(this, '_matcher', {
        writable:     true,
        enumerable:   false,
        confiugrable: true,
        value:        matcher,
      });
    }

    clone(offset) {
      return super.clone(offset, [ this._matcher ]);
    }

    respond(context) {
      var opts      = this.getOptions();
      var matcher   = this.getMatchers(this._matcher);
      var result    = matcher.exec(this.getParser(), this.startOffset, context);

      if (opts.debugInspect)
        debugger;

      if (result === false || result == null)
        return this.skip(context);

      if (result instanceof Error)
        return result;

      // fail on valid match
      return this.fail(context);
    }
  };
});

module.exports = {
  $NOT,
};
