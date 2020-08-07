const { isType }                                      = require('../utils');
const { defineTokenMatcher, Token, TokenDefinition }  = require('../token');

class LoopToken extends Token {
  clone(_props) {
    var props     = _props || {},
        children  = props.children || this.children || [];

    return super.clone(Object.assign({}, {
      _length: children.length
    }, props));
  }
}

const $LOOP = defineTokenMatcher('$LOOP', (ParentClass) => {
  return class LoopTokenMatcher extends ParentClass {
    constructor(..._matchers) {
      var matchers  = _matchers,
          opts      = matchers[matchers.length - 1];

      if (opts instanceof TokenDefinition)
        opts = {};
      else
        matchers = matchers.slice(0, -1);

      super(opts);

      this.setMatchers(...matchers);
    }

    setMatchers(...matchers) {
      for (var i = 0, il = matchers.length; i < il; i++) {
        if (!isType(matchers[i], 'TokenDefinition'))
          throw new TypeError(`$LOOP::setMatchers: Matcher at index '${i}' is not a \`TokenDefinition\``);
      }

      Object.defineProperty(this, '_matchers', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: matchers
      });
    }

    respond() {
      var matchers    = this._matchers,
          children    = [],
          running     = true;

      while(running) {
        for (var i = 0, il = matchers.length; i < il; i++) {
          var matcher = matchers[i],
              result  = matcher.exec(this.getParser(), this.endOffset);

          if (result == null)
            continue;

          if (result === false) {
            running = false;
            break;
          }

          // Here we return the error, instead of calling this.error
          // because this.error has already been called, so we don't
          // want to duplicate the error
          if (result instanceof Error)
            return result;

          if (result instanceof Token) {
            children.push(result);

            this.endOffset = result.getSourceRange().end;
            continue;
          }

          throw new TypeError(`${matcher.getTypeName()}::respond: Returned an invalid value. Matcher results must be defined by a call to one of \`success\`, \`fail\`, \`skip\`, or \`error\``);
        }

        if (children.length === 0)
          break;
      }

      if (children.length === 0)
        return fail();

      var token = this.successWithoutFinalize(this.endOffset, {
        _length: children.length,
        children
      }, LoopToken);

      token.remapParentTokenForAllChildren();

      // Now finally set it to the final resolved token
      return this.finalize(token);
    }
  };
});

module.exports = {
  LoopToken,
  $LOOP
};
