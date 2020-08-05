const { isType }                                      = require('../utils');
const { defineTokenMatcher, Token, TokenDefinition }  = require('../token');

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
          captures    = [],
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
            captures.push(result);

            this.endOffset = result.getSourceRange().end;
            continue;
          }

          throw new TypeError(`${matcher.getTypeName()}::respond: Returned an invalid value. Matcher results must be defined by a call to one of \`success\`, \`fail\`, \`skip\`, or \`error\``);
        }

        if (captures.length === 0)
          break;
      }

      if (captures.length === 0)
        return fail();

      var token = this.successWithoutFinalize(this.endOffset, undefined);
      Object.defineProperties(token, {
        length: {
          writable: false,
          enumerable: false,
          configurable: false,
          value: captures.length
        },
        captures: {
          writable: false,
          enumerable: false,
          configurable: false,
          value: captures
        }
      });

      return this.finalize(token);
    }
  };
});

module.exports = {
  $LOOP
};
