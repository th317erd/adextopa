const { isType }               = require('../utils');
const { defineMatcher, Token } = require('../token');

class LoopToken extends Token {
  clone(_props) {
    var props     = _props || {},
        children  = props.children || this.children || [];

    return super.clone(Object.assign({}, {
      _length: children.length
    }, props));
  }
}

const $LOOP = defineMatcher('$LOOP', (ParentClass) => {
  return class LoopMatcher extends ParentClass {
    constructor(matcher, opts) {
      super(opts);

      this.setMatcher(matcher);
    }

    setMatcher(matcher) {
      if (!isType(matcher, 'MatcherDefinition'))
        throw new TypeError(`$LOOP::setMatcher: First argument must be instance of \`MatcherDefinition\``);

      Object.defineProperty(this, '_matcher', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: matcher
      });
    }

    respond(context) {
      var opts        = this.getOptions(),
          matcher     = this.getMatchers(this._matcher),
          children    = [],
          min         = opts.min || 1,
          max         = opts.max || Infinity,
          count       = 0,
          parser      = this.getParser(),
          offset      = this.startOffset;

      if (opts.debugInspect)
        debugger;

      while(count < max) {
        var result = matcher.exec(parser, offset, context);

        // We break on skipping... because skipping isn't allowed in a loop
        if (result == null || result === false)
          break;

        // Here we return the error, instead of calling this.error
        // because this.error has already been called, so we don't
        // want to duplicate the error
        if (result instanceof Error)
          return result;

        if (result instanceof Token) {
          offset = this.endOffset = result.getSourceRange().end;

          if (!result.skipOutput())
            children.push(result);

          count++;

          continue;
        }

        throw new TypeError(`${matcher.getTypeName()}::respond: Returned an invalid value. Matcher results must be defined by a call to one of \`success\`, \`fail\`, \`skip\`, or \`error\``);
      }

      if (count < min || children.length === 0)
        return this.fail(context);

      var token = this.successWithoutFinalize(context, this.endOffset, {
        _length: children.length,
        children
      }, LoopToken);

      // Now finally set it to the final resolved token
      return this.finalize(context, token);
    }
  };
});

module.exports = {
  LoopToken,
  $LOOP
};
