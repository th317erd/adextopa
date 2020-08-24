const { isType }        = require('../utils');
const { Token }         = require('../token');
const { defineMatcher } = require('../matcher-definition');

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

    clone(offset) {
      return super.clone(offset, [ this._matcher ]);
    }

    respond(context) {
      var opts        = this.getOptions(),
          matcher     = this.getMatchers(this._matcher),
          source      = this.getSourceAsString(),
          min         = opts.min || 1,
          max         = opts.max || Infinity,
          count       = 0,
          parser      = this.getParser(),
          offset      = this.startOffset,
          thisToken   = this.createToken(this.getSourceRange(), {
            typeName: this.getTypeName(),
            _length:  0,
            children: []
          }, LoopToken);

      context.parent = thisToken;

      thisToken = this.callHook('before', context, thisToken);

      if (opts.debugInspect)
        debugger;

      while(count < max) {
        if (typeof opts.optimize === 'function') {
          if (this.callHook('optimize', context, thisToken, { source, offset, count }) === false)
            break;
        }

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

          if (!result.skipOutput()) {
            if (!thisToken.children)
              thisToken.children = [];

            thisToken.children.push(result);
          }

          thisToken.setSourceRange(this.getSourceRange());
          thisToken.length = (thisToken.children || []).length;

          count++;

          continue;
        }

        throw new TypeError(`${matcher.getTypeName()}::respond: Returned an invalid value. Matcher results must be defined by a call to one of \`success\`, \`fail\`, \`skip\`, or \`error\``);
      }

      thisToken = this.callHook('after', context, thisToken);

      if (count < min)
        return this.fail(context);

      if ((thisToken.children || []).length === 0)
        return this.skip(context, this.endOffset);

      return this.success(context, thisToken.remapTokenLinks());
    }
  };
});

module.exports = {
  LoopToken,
  $LOOP
};
