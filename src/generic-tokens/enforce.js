
const { isType }        = require('../utils');
const { defineMatcher } = require('../matcher-definition');

const $ENFORCE = defineMatcher('$ENFORCE', (ParentClass) => {
  return class EnforceMatcher extends ParentClass {
    constructor(matcher, _opts) {
      var opts = _opts || {};
      if (isType(_opts, 'string'))
        opts = { typeName: opts };
      else if (isType(_opts, 'function'))
        opts = { onFail: _opts };

      const defaultOnFail   = (context, sourceRange, origin) => {
        var sourceString    = origin.getSourceAsString();
        var matcher         = origin._matcher;
        var enclosingStart  = "'";
        var enclosingEnd    = "'";
        var found           = (sourceRange.start === sourceRange.end)
                              ? sourceString.substring(sourceRange.start, sourceRange.start + 1)
                              : sourceString.substring(sourceRange.start, sourceRange.end);

        if (found === enclosingStart) {
          enclosingStart  = '[';
          enclosingEnd    = ']';
        }

        throw new Error(`Expected to match against ${matcher.getErrorTypeName()}, but found ${enclosingStart}${found.substring(0, 20)}${enclosingEnd} instead`);
      };

      super(Object.assign({ onFail: defaultOnFail }, opts));

      this.setMatcher(matcher);
    }

    setMatcher(matcher) {
      if (!isType(matcher, 'MatcherDefinition'))
        throw new TypeError('$ENFORCE::setMatcher: First argument must be instance of `MatcherDefinition`');

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
      var newContext  = Object.assign(Object.create(context), { enforce: true, runFinalize: false });
      var result      = matcher.exec(this.getParser(), this.startOffset, newContext);

      if (opts.debugInspect)
        debugger;

      if (result === false)
        return this.fail(context, matcher.endOffset);

      if (result instanceof Error)
        return result;

      if (opts.consume === false)
        return this.skip(context);

      if (result == null)
        return this.skip(context);

      if (result.skipOutput())
        return result;

      return this.success(context, result);
    }
  };
});

module.exports = {
  $ENFORCE,
};
