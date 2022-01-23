const {
  isType,
  flattenArray,
}                       = require('../utils');
const { defineMatcher } = require('../matcher-definition');
const { $OPTIONAL }     = require('./optional');
const { $NOT }          = require('./not');
const { $MATCHES }      = require('./matches');
const { $EQUALS }       = require('./equals');
const { $UNTIL }        = require('./until');
const { $LOOP }         = require('./loop');
const { $PROGRAM }      = require('./program');

const $GROUP = defineMatcher('$GROUP', (ParentClass) => {
  return class GroupMatcher extends ParentClass {
    constructor(startMatcher, endMatcher, escapeMatcher, opts) {
      super(opts);

      this.setMatcher(startMatcher, endMatcher, escapeMatcher);
    }

    getMatcherDefinitionMatcher(startMatcher, endMatcher, escapeMatcher) {
      return $PROGRAM(
        startMatcher,
        $LOOP(
          $PROGRAM(
            $OPTIONAL(escapeMatcher, 'Escape'),
            $NOT(endMatcher),
            $MATCHES(/(.)/, 'Content'),
          ),
        ),
        endMatcher,
      );
    }

    getStringMatcher(startMatcher, endMatcher, escapeMatcher) {
      return $PROGRAM(
        $EQUALS(startMatcher),
        $UNTIL(endMatcher, escapeMatcher),
        $EQUALS(endMatcher),
      );
    }

    setMatcher(startMatcher, endMatcher, escapeMatcher) {
      if (isType(startMatcher, 'MatcherDefinition')) {
        if (!isType(endMatcher, 'MatcherDefinition'))
          throw new TypeError('$GROUP::setMatcher: Second argument must be instance of `MatcherDefinition`');

        if (!isType(escapeMatcher, 'MatcherDefinition'))
          throw new TypeError('$GROUP::setMatcher: Third argument must be instance of `MatcherDefinition`');
      } else if (isType(startMatcher, 'string')) {
        if (!isType(endMatcher, 'string'))
          throw new TypeError('$GROUP::setMatcher: Second argument must be instance of `string`');

        if (!isType(escapeMatcher, 'string'))
          throw new TypeError('$GROUP::setMatcher: Third argument must be instance of `MatcherDefinition`');
      } else {
        throw new TypeError('$GROUP::setMatcher: First argument must be instance of `string`, or `MatcherDefinition`');
      }

      var matcher;
      if (isType(startMatcher, 'MatcherDefinition'))
        matcher = this.getMatcherDefinitionMatcher(startMatcher, endMatcher, escapeMatcher);
      else
        matcher = this.getStringMatcher(startMatcher, endMatcher, escapeMatcher);

      Object.defineProperties(this, {
        '_matcher': {
          writable:     true,
          enumerable:   false,
          confiugrable: true,
          value:        matcher,
        },
        '_startMatcher': {
          writable:     true,
          enumerable:   false,
          confiugrable: true,
          value:        startMatcher,
        },
        '_endMatcher': {
          writable:     true,
          enumerable:   false,
          confiugrable: true,
          value:        endMatcher,
        },
        '_escapeMatcher': {
          writable:     true,
          enumerable:   false,
          confiugrable: true,
          value:        escapeMatcher,
        }
      });
    }

    clone(offset) {
      return super.clone(offset, [ this._startMatcher, this._endMatcher, this._escapeMatcher ]);
    }

    respond(context) {
      var opts    = this.getOptions();
      var matcher = this.getMatchers(this._matcher);
      var result  = matcher.exec(this.getParser(), this.startOffset, context);

      if (result === false)
        return this.fail(context);

      if (result == null)
        return this.skip(context);

      if (result instanceof Error)
        return result;

      if (result.skipOutput())
        return result;

      this.endOffset = result.getSourceRange().end;

      var resultBodyToken = result.children[1];
      var bodyValue       = (resultBodyToken.typeName === '$UNTIL') ? resultBodyToken.value : flattenArray(resultBodyToken.visit((token) => token.typeName !== '$PROGRAM', (token) => token[1])).join('');
      var bodyToken       = this.createToken(resultBodyToken.getSourceRange().clone(), { value: bodyValue });

      if (opts.debugInspect)
        debugger;

      var token = this.successWithoutFinalize(
        context,
        this.endOffset,
        {
          start:  result.children[0],
          end:    result.children[2],
          body:   bodyToken,
        }
      );

      return this.success(context, token);
    }
  };
});

module.exports = {
  $GROUP,
};
