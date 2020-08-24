const { isType }        = require('../utils');
const { defineMatcher } = require('../matcher-definition');

const $OPTIONAL = defineMatcher('$OPTIONAL', (ParentClass) => {
  return class OptionalMatcher extends ParentClass {
    constructor(matcher, opts) {
      super(Object.assign({ debugSkip: true }, opts || {}));

      this.setMatcher(matcher);
    }

    setMatcher(matcher) {
      if (!isType(matcher, 'MatcherDefinition'))
        throw new TypeError('$OPTIONAL::setTokenDefinition: First argument must be instance of `MatcherDefinition`');

      Object.defineProperty(this, '_matcher', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: matcher
      });
    }

    clone(offset) {
      return super.clone(offset, [ this._matcher ]);
    }

    respond(context) {
      var opts    = this.getOptions(),
          matcher = this.getMatchers(this._matcher),
          result  = matcher.exec(this.getParser(), this.getSourceRange(), context);

      if (opts.debugInspect)
        debugger;

      if (!result || result === false)
        return this.skip(context);

      if (result instanceof Error)
        return result;

      if (result.skipOutput())
        return result;

      return this.success(context, result);
    }
  };
});

module.exports = {
  $OPTIONAL
};
