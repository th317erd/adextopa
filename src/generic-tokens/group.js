const { isType }      = require('../utils');
const {
  defineMatcher,
  MatcherDefinition
}                     = require('../token');
const { $OPTIONAL }   = require('./optional');
const { $NOT }        = require('./not');
const { $MATCHES }    = require('./matches');
const { $LOOP }       = require('./loop');
const { $PROGRAM }    = require('./program');

const $GROUP = defineMatcher('$GROUP', (ParentClass) => {
  return class GroupMatcher extends ParentClass {
    constructor(startMatcher, endMatcher, escapeMatcher, opts) {
      super(opts);

      this.setMatcher(startMatcher, endMatcher, escapeMatcher);
    }

    setMatcher(startMatcher, endMatcher, escapeMatcher) {
      if (!(startMatcher instanceof MatcherDefinition))
        throw new TypeError('$GROUP::setMatcher: First argument must be instance of `MatcherDefinition`');

      if (!(endMatcher instanceof MatcherDefinition))
        throw new TypeError('$GROUP::setMatcher: Second argument must be instance of `MatcherDefinition`');

      if (!(escapeMatcher instanceof MatcherDefinition))
        throw new TypeError('$GROUP::setMatcher: Third argument must be instance of `MatcherDefinition`');

      var matcher = $PROGRAM(
        startMatcher,
        $LOOP(
          $PROGRAM(
            $OPTIONAL(escapeMatcher, 'Escape'),
            $NOT(endMatcher),
            $MATCHES(/(.)/, 'Content')
          )
        ),
        endMatcher
      );

      Object.defineProperties(this, {
        _matcher: {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: matcher
        }
      });
    }

    respond(context) {
      var matcher = this._matcher,
          result  = matcher.exec(this.getParser(), this.startOffset, context);

      if (result === false)
        return this.fail();

      if (result == null)
        return this.skip();

      if (result instanceof Error)
        return result;

      if (result.skipOutput())
        return result;

      this.endOffset = result.getSourceRange().end;

      var bodyValue = result.children[1].visit((token) => token.typeName !== '$PROGRAM', (token) => token[1]).join(''),
          bodyToken = this.createToken(result.children[1].getSourceRange().clone(), { value: bodyValue });

      var token = this.successWithoutFinalize(this.endOffset, {
        start:  result.children[0],
        end:    result.children[2],
        body:   bodyToken
      });

      return this.success(token);
    }
  };
});

module.exports = {
  $GROUP
};
