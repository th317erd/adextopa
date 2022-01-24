const { isType }        = require('../utils');
const { defineMatcher } = require('../matcher-definition');

const $OPTIONAL = defineMatcher('$OPTIONAL', (ParentClass) => {
  return class OptionalMatcher extends ParentClass {
    constructor(matcher, _opts) {
      var opts = _opts || {};
      if (isType(_opts, 'string'))
        opts = { typeName: opts };

      super(Object.assign({ debugSkip: true }, opts || {}));

      this.setMatcher(matcher);
    }

    setMatcher(matcher) {
      if (!isType(matcher, 'MatcherDefinition'))
        throw new TypeError('$OPTIONAL::setTokenDefinition: First argument must be instance of `MatcherDefinition`');

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
      var opts        = this.getOptions();
      var matcher     = this.getMatchers(this._matcher);
      var newContext  = Object.assign(Object.create(context), { optional: true });
      var result      = matcher.exec(this.getParser(), this.getSourceRange(), newContext);

      if (opts.debugInspect)
        debugger;

      if (result instanceof Error)
        return result;

      if (!result || result === false)
        return this.skip(context);

      if (result.skipOutput())
        return result;

      return this.success(context, result);
    }
  };
});

module.exports = {
  $OPTIONAL,
};
