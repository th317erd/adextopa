const { isType, isValidNumber } = require('../utils');
const { Token, SkipToken }      = require('../token');
const { defineMatcher }         = require('../matcher-definition');

class ProgramToken extends Token {
  clone(_props) {
    var props     = _props || {};
    var children  = props.children || this.children || [];

    return super.clone(Object.assign({}, {
      '_length': children.length,
    }, props));
  }
}

function getMatchersAndOptionsFromArguments(..._matchers) {
  var matchers  = _matchers;
  var opts      = matchers[matchers.length - 1];

  if (isType(opts, 'MatcherDefinition'))
    opts = {};
  else
    matchers = matchers.slice(0, -1);

  return {
    opts,
    matchers,
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
        writable:     true,
        enumerable:   false,
        confiugrable: true,
        value:        matchers,
      });
    }

    clone(offset) {
      return super.clone(offset, this._matchers);
    }

    respond(context, remapTokenLinks) {
      var opts        = this.getOptions();
      var matchers    = this.getMatchers(this._matchers);
      var source      = this.getSourceAsString();
      var offset      = this.startOffset;
      var count       = 0;
      var skipCount   = 0;
      var thisToken   = this.createToken(
        this.getSourceRange(),
        {
          typeName: this.getTypeName(),
          _length:  0,
          children: []
        },
        ProgramToken,
      );
      var newContext  = Object.assign(Object.create(context), { program: thisToken });
      var i;
      var il;

      context.parent = thisToken;

      thisToken = this.callHook('before', context, thisToken);

      if (opts.debugInspect)
        debugger;

      for (i = 0, il = matchers.length; i < il; i++) {
        if (context.isStopped)
          break;

        if (typeof opts.optimize === 'function') {
          var result = this.callHook('optimize', newContext, thisToken, { source, offset, count, index: i });
          if (result === false)
            break;

          if (isValidNumber(result) && result < matchers.length)
            i = result;
        }

        var matcher = matchers[i];

        var result  = matcher.exec(this.getParser(), this.endOffset, newContext);

        if (this.getTypeName() === 'CheckNextCommandName')
          debugger;

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
          var outputToken = result.getOutputToken();
          offset = this.endOffset = outputToken.getSourceRange().end;

          var skipResult = result.skipOutput();
          if (!skipResult) {
            if (!thisToken.children)
              thisToken.children = [];

            thisToken.children.push(outputToken);
          } else {
            skipCount++;
          }

          thisToken.setSourceRange(this.getSourceRange());

          count++;

          if (!skipResult && opts.stopOnFirstMatch)
            break;

          continue;
        }

        throw new TypeError(`${matcher.getTypeName()}::respond: Returned an invalid value. Matcher results must be defined by a call to one of \`success\`, \`fail\`, \`skip\`, or \`error\``);
      }

      thisToken = this.callHook('after', context, thisToken);

      if (!opts.stopOnFirstMatch && i < matchers.length)
        return this.fail(context, this.endOffset);

      if ((thisToken.children || []).length === 0) {
        if (skipCount === matchers.length)
          return this.skip(context, this.endOffset);
        else
          return this.fail(context, this.endOffset);
      }

      return this.success(context, (remapTokenLinks === false) ? thisToken : thisToken.remapTokenLinks());
    }
  };
});

$PROGRAM.getMatchersAndOptionsFromArguments = getMatchersAndOptionsFromArguments;

module.exports = {
  ProgramToken,
  $PROGRAM,
};
