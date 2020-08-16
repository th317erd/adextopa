const { defineMatcher, MatcherDefinition } = require('../token');

const $NOT = defineMatcher('$NOT', (ParentClass) => {
  return class NotMatcher extends ParentClass {
    constructor(matcher, opts) {
      super(opts);

      this.setMatcher(matcher);
    }

    setMatcher(matcher) {
      if (!(matcher instanceof MatcherDefinition))
        throw new TypeError('$NOT::setMatcher: First argument must be instance of `MatcherDefinition`');

      Object.defineProperty(this, '_matcher', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: matcher
      });
    }

    respond(context) {
      var matcher   = this._matcher,
          result    = matcher.exec(this.getParser(), this.startOffset, context);

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
  $NOT
};
