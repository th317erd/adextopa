const { isType }        = require('../utils');
const { defineMatcher } = require('../matcher-definition');

const $SEQUENCE = defineMatcher('$SEQUENCE', (ParentClass) => {
  return class SequenceMatcher extends ParentClass {
    constructor(endMatcher, _escapeChar, _opts) {
      var escapeChar  = _escapeChar,
          opts        = (arguments.length === 3) ? _opts : escapeChar;

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
      if (!isType(endMatcher, 'string'))
        throw new TypeError('$SEQUENCE::setMatcher: First argument must be instance of `string`');

      if (escapeChar) {
        if (!isType(escapeChar, 'string'))
          throw new TypeError('$SEQUENCE::setMatcher: Second argument must be instance of `string`');

        if (escapeChar.length !== 1)
          throw new Error('$SEQUENCE::setMatcher: Second argument must be a string with length of 1');
      }

      Object.defineProperties(this, {
        '_endMatcher': {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: endMatcher
        },
        '_escapeChar': {
          writable: true,
          enumerable: false,
          confiugrable: true,
          value: escapeChar
        }
      });
    }

    clone(offset) {
      return super.clone(offset, [ this._endMatcher, this._escapeChar ]);
    }

    respond(context) {
      const matchStr = (sourceStr, offset, matcher) => {
        for (var i = 0, il = matcher.length; i < il; i++) {
          var char1 = sourceStr.charAt(offset + i),
              char2 = matcher.charAt(i);

          if (char1 !== char2)
            return false;
        }

        return true;
      };

      var opts        = this.getOptions(),
          endMatcher  = this._endMatcher,
          escapeChar  = this._escapeChar,
          sourceStr   = this.getSourceAsString(),
          offset      = this.startOffset,
          escaped     = false,
          value       = [];

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

        if (matchStr(sourceStr, offset, endMatcher))
          break;

        value.push(char);
        offset++;
      }

      return this.success(context, offset, { value: value.join('') });
    }
  };
});

module.exports = {
  $SEQUENCE
};
