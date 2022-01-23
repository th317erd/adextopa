const { isType }        = require('../utils');
const { defineMatcher } = require('../matcher-definition');

const $UNTIL = defineMatcher('$UNTIL', (ParentClass) => {
  return class UntilMatcher extends ParentClass {
    constructor(endMatcher, _escapeChar, _opts) {
      var escapeChar  = _escapeChar;
      var opts        = (arguments.length === 3) ? _opts : escapeChar;

      if (arguments.length < 3) {
        if (isType(opts, 'object'))
          escapeChar = undefined;
        else
          opts = undefined;
      }

      super(opts);

      this.setMatchers(endMatcher, escapeChar);
    }

    setMatchers(endMatcher, escapeChar) {
      if (!isType(endMatcher, 'string') && !isType(endMatcher, RegExp) && !isType(endMatcher, 'array'))
        throw new TypeError('$UNTIL::setMatcher: First argument must be instance of `string`, `RegExp`, or `Array`');

      if (escapeChar) {
        if (!isType(escapeChar, 'string'))
          throw new TypeError('$UNTIL::setMatcher: Second argument must be instance of `string`');

        if (escapeChar.length !== 1)
          throw new Error('$UNTIL::setMatcher: Second argument must be a string with length of 1');
      }

      Object.defineProperties(this, {
        '_endMatcher': {
          writable:     true,
          enumerable:   false,
          confiugrable: true,
          value:        endMatcher,
        },
        '_escapeChar': {
          writable:     true,
          enumerable:   false,
          confiugrable: true,
          value:        escapeChar,
        }
      });
    }

    clone(offset) {
      return super.clone(offset, [ this._endMatcher, this._escapeChar ]);
    }

    respond(context) {
      var opts        = this.getOptions();
      var endMatcher  = this._endMatcher;
      var escapeChar  = this._escapeChar;
      var sourceStr   = this.getSourceAsString();
      var offset      = this.startOffset;
      var escaped     = false;
      var value       = [];

      if (opts.debugInspect)
        debugger;

      for (var len = sourceStr.length; offset < len;) {
        var char = sourceStr.charAt(offset);

        if (escapeChar) {
          if (escaped) {
            value.push(char);
            escaped = false;
            offset++;

            continue;
          }

          if (char === escapeChar) {
            escaped = true;
            offset++;

            continue;
          }
        }

        if (this.matches(sourceStr, offset, endMatcher))
          break;

        value.push(char);
        offset++;
      }

      return this.success(context, offset, { value: value.join('') });
    }
  };
});

module.exports = {
  $UNTIL,
};
