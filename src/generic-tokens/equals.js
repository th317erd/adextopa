const { isType }              = require('../utils');
const { defineTokenMatcher }  = require('../token');

const $EQUALS = defineTokenMatcher('$EQUALS', (ParentClass) => {
  return class EqualsTokenMatcher extends ParentClass {
    constructor(str, opts) {
      super(opts);

      this.setMatcher(str);
    }

    setMatcher(str) {
      if (!isType(str, 'string'))
        throw new TypeError('$EQ::setMatcher: First argument must be instance of `string`');

      Object.defineProperty(this, '_matcher', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: str
      });
    }

    respond() {
      var matcher   = this._matcher,
          sourceStr = this.getSourceAsString(),
          offset    = this.startOffset;

      for (var i = 0, il = matcher.length; i < il; i++) {
        var char1 = sourceStr.charAt(offset + i),
            char2 = matcher.charAt(i);

        if (char1 !== char2)
          return this.fail();
      }

      return this.success(matcher.length, { value: matcher });
    }
  };
});

module.exports = {
  $EQUALS
};
