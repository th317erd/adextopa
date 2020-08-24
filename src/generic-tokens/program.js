const { isType, isValidNumber } = require('../utils');
const { Token }                 = require('../token');
const { defineMatcher }         = require('../matcher-definition');

class ProgramToken extends Token {
  clone(_props) {
    var props     = _props || {},
        children  = props.children || this.children || [];

    return super.clone(Object.assign({}, {
      _length: children.length
    }, props));
  }
}

function getMatchersAndOptionsFromArguments(..._matchers) {
  var matchers  = _matchers,
      opts      = matchers[matchers.length - 1];

  if (isType(opts, 'MatcherDefinition'))
    opts = {};
  else
    matchers = matchers.slice(0, -1);

  return {
    opts,
    matchers
  };
}

const $PROGRAM = defineMatcher('$PROGRAM', (ParentClass) => {
  return class ProgramMatcher extends ParentClass {
    constructor(...args) {
      var { matchers, opts } = getMatchersAndOptionsFromArguments(...args);

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

    clone(offset) {
      return super.clone(offset, this._matchers);
    }

    respond(context) {
      var opts        = this.getOptions(),
          matchers    = this.getMatchers(this._matchers),
          source      = this.getSourceAsString(),
          offset      = this.startOffset,
          count       = 0,
          thisToken   = this.createToken(this.getSourceRange(), {
            typeName: this.getTypeName(),
            _length:  0,
            children: []
          }, ProgramToken),
          i, il;

      context.parent = thisToken;

      thisToken = this.callHook('before', context, thisToken);

      if (opts.debugInspect)
        debugger;

      for (i = 0, il = matchers.length; i < il; i++) {
        if (typeof opts.optimize === 'function') {
          var result = this.callHook('optimize', context, thisToken, { source, offset, count, index: i });
          if (result === false)
            break;

          if (isValidNumber(result) && result < matchers.length)
            i = result;
        }

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
          offset = this.endOffset = result.getSourceRange().end;

          var skipResult = result.skipOutput();
          if (!skipResult) {
            if (!thisToken.children)
              thisToken.children = [];

            thisToken.children.push(result);
          }

          thisToken.setSourceRange(this.getSourceRange());
          thisToken.length = (thisToken.children || []).length;

          count++;

          if (!skipResult && opts.stopOnFirstMatch)
            break;

          continue;
        }

        throw new TypeError(`${matcher.getTypeName()}::respond: Returned an invalid value. Matcher results must be defined by a call to one of \`success\`, \`fail\`, \`skip\`, or \`error\``);
      }

      thisToken = this.callHook('after', context, thisToken);

      if (!opts.stopOnFirstMatch && i < matchers.length)
        return this.fail(context);

      if (this.startOffset === this.endOffset || count === 0)
        return this.fail(context);

      if ((thisToken.children || []).length === 0)
        return this.skip(context, this.endOffset);

      return this.success(context, thisToken.remapTokenLinks());
    }
  };
});

$PROGRAM.getMatchersAndOptionsFromArguments = getMatchersAndOptionsFromArguments;

module.exports = {
  ProgramToken,
  $PROGRAM
};
