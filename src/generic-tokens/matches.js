const {
  isType,
  addRegExpFlags
}                             = require('../utils');
const { defineMatcher }  = require('../token');

const $MATCHES = defineMatcher('$MATCHES', (ParentClass) => {
  return class MatchesMatcher extends ParentClass {
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

    respond(context) {
      var regexpMatcher = this._matcher,
          sourceStr     = this.getSourceAsString();

      regexpMatcher.lastIndex = this.startOffset;

      var result = regexpMatcher.exec(sourceStr);
      if (!result || result.index !== this.startOffset)
        return this.fail(context);

      var captures = {};
      for (var i = 0, il = result.length; i < il; i++)
        captures[i] = result[i];

      return this.success(context, this.startOffset + result[0].length, captures);
    }
  };
});

module.exports = {
  $MATCHES
};
