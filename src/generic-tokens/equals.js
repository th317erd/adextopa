const { isType }              = require('../utils');
const { defineMatcher }  = require('../token');

const $EQUALS = defineMatcher('$EQUALS', (ParentClass) => {
  return class EqualsMatcher extends ParentClass {
    constructor(str, opts) {
      super(opts);

      this.setMatcher(str);
    }

    setMatcher(str) {
      if (!isType(str, 'string'))
        throw new TypeError('$EQUALS::setMatcher: First argument must be instance of `string`');

      Object.defineProperty(this, '_matcher', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: str
      });
    }

    respond(context) {
      var matcher   = this._matcher,
          sourceStr = this.getSourceAsString(),
          offset    = this.startOffset;

      for (var i = 0, il = matcher.length; i < il; i++) {
        var char1 = sourceStr.charAt(offset + i),
            char2 = matcher.charAt(i);

        if (char1 !== char2)
          return this.fail();
      }

      return this.success(this.startOffset + matcher.length, { value: matcher });
    }
  };
});

module.exports = {
  $EQUALS
};
