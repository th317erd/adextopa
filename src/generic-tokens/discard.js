
const { isType } = require('../utils');
const {
  defineMatcher,
  SkipToken
} = require('../token');

const $DISCARD = defineMatcher('$DISCARD', (ParentClass) => {
  return class DiscardMatcher extends ParentClass {
    constructor(matcher, opts) {
      super(opts);

      this.setMatcher(matcher);
    }

    setMatcher(matcher) {
      if (!isType(matcher, 'MatcherDefinition'))
        throw new TypeError('$DISCARD::setMatcher: First argument must be instance of `MatcherDefinition`');

      Object.defineProperty(this, '_matcher', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: matcher
      });
    }

    respond(context) {
      var opts      = this.getOptions(),
          matcher   = this.getMatchers(this._matcher),
          result    = matcher.exec(this.getParser(), this.startOffset, context);

      if (opts.debugInspect)
        debugger;

      if (result === false)
        return this.fail(context);

      if (result instanceof Error)
        return result;

      if (result == null)
        return this.skip(context);

      if (result.skipOutput())
        return result;

      // "discard" by creating special "skip" token
      var token = this.createToken(this.getParser().createSourceRange(this.startOffset, result.getSourceRange().end), undefined, SkipToken);
      return this.success(context, token);
    }
  };
});

module.exports = {
  $DISCARD
};
