const { isType }              = require('../utils');
const { defineMatcher }  = require('../token');

const $OPTIONAL = defineMatcher('$OPTIONAL', (ParentClass) => {
  return class OptionalMatcher extends ParentClass {
    constructor(matcher, opts) {
      super(opts);

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

    respond(context) {
      var matcher = this._matcher,
          result  = matcher.exec(this.getParser(), this.getSourceRange(), context);

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
