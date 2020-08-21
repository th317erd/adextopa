const { isType }      = require('../utils');
const {
  defineMatcher,
  Token,
  MatcherDefinition
}                     = require('../token');

class ProgramToken extends Token {
  clone(_props) {
    var props     = _props || {},
        children  = props.children || this.children || [];

    return super.clone(Object.assign({}, {
      _length: children.length
    }, props));
  }
}

const $PROGRAM = defineMatcher('$PROGRAM', (ParentClass) => {
  return class ProgramMatcher extends ParentClass {
    constructor(..._matchers) {
      var matchers  = _matchers,
          opts      = matchers[matchers.length - 1];

      if (isType(opts, 'MatcherDefinition'))
        opts = {};
      else
        matchers = matchers.slice(0, -1);

      super(opts);

      this.setMatchers(...matchers);
    }

    setMatchers(...matchers) {
      for (var i = 0, il = matchers.length; i < il; i++) {
        if (!isType(matchers[i], 'MatcherDefinition'))
          throw new TypeError(`$PROGRAM::setMatchers: Matcher at index '${i}' is not a \`MatcherDefinition\``);
      }

      Object.defineProperty(this, '_matchers', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: matchers
      });
    }

    respond(context) {
      var opts        = this.getOptions(),
          matchers    = this.getMatchers(this._matchers),
          children    = [],
          i, il;

      if (opts.debugInspect)
        debugger;

      for (i = 0, il = matchers.length; i < il; i++) {
        var matcher = matchers[i],
            result  = matcher.exec(this.getParser(), this.endOffset, context);

        if (result == null)
          continue;

        if (result === false)
          break;

        // Here we return the error, instead of calling this.error
        // because this.error has already been called, so we don't
        // want to duplicate the error
        if (result instanceof Error)
          return result;

        if (result instanceof Token) {
          this.endOffset = result.getSourceRange().end;

          if (!result.skipOutput())
            children.push(result);

          continue;
        }

        throw new TypeError(`${matcher.getTypeName()}::respond: Returned an invalid value. Matcher results must be defined by a call to one of \`success\`, \`fail\`, \`skip\`, or \`error\``);
      }

      if (i < matchers.length)
        return this.fail(context);

      if (children.length === 0)
        return;

      var token = this.successWithoutFinalize(context, this.endOffset, {
        _length: children.length,
        children
      }, ProgramToken);

      // Now finally set it to the final resolved token
      return this.finalize(context, token);
    }
  };
});

module.exports = {
  ProgramToken,
  $PROGRAM
};
