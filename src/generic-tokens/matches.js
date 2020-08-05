const {
  isType,
  addRegExpFlags
}                             = require('../utils');
const { defineTokenMatcher }  = require('../token');

const $MATCHES = defineTokenMatcher('$MATCHES', (ParentClass) => {
  return class MatchesTokenMatcher extends ParentClass {
    constructor(re, opts) {
      super(opts);

      this.setMatcher(re);
    }

    setMatcher(re) {
      if (!isType(re, 'string', 'RegExp'))
        throw new TypeError('$RE::setMatcher: First argument must be instance of `string` or `RegExp`');

      Object.defineProperty(this, '_matcher', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: addRegExpFlags(re, 'g')
      });
    }

    respond() {
      var matcher   = this._matcher,
          sourceStr = this.getSourceAsString();

      matcher.lastIndex = this.startOffset;

      var result = matcher.exec(sourceStr);
      if (!result || result.index !== this.startOffset)
        return this.fail();

      var captures = {};
      for (var i = 0, il = result.length; i < il; i++)
        captures[i] = result[i];

      return this.success(result[0].length, captures);
    }
  };
});

module.exports = {
  $MATCHES
};
