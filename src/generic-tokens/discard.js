const { defineMatcher, MatcherDefinition, SkipToken } = require('../token');

const $DISCARD = defineMatcher('$DISCARD', (ParentClass) => {
  return class DiscardMatcher extends ParentClass {
    constructor(matcher, opts) {
      super(opts);

      this.setMatcher(matcher);
    }

    setMatcher(matcher) {
      if (!(matcher instanceof MatcherDefinition))
        throw new TypeError('$DISCARD::setMatcher: First argument must be instance of `MatcherDefinition`');

      Object.defineProperty(this, '_matcher', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: matcher
      });
    }

    respond() {
      var matcher   = this._matcher,
          result    = matcher.exec(this.getParser(), this.startOffset);

      if (result === false)
        return this.fail();

      if (result instanceof Error)
        return result;

      if (result == null)
        return;

      // "discard" by creating special "skip" token
      var token = this.createToken(this.getParser().createSourceRange(this.startOffset, result.getSourceRange().end), undefined, SkipToken);
      return this.success(token);
    }
  };
});

module.exports = {
  $DISCARD
};
