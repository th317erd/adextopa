const { isType }              = require('../utils');
const { defineTokenMatcher }  = require('../token');

const $OPTIONAL = defineTokenMatcher('$OPTIONAL', (ParentClass) => {
  return class OptionalTokenMatcher extends ParentClass {
    constructor(matcher, opts) {
      super(opts);

      this.setMatcher(matcher);
    }

    setMatcher(matcher) {
      if (!isType(matcher, 'TokenDefinition'))
        throw new TypeError('$OPTIONAL::setTokenDefinition: First argument must be instance of `TokenDefinition`');

      Object.defineProperty(this, '_matcher', {
        writable: true,
        enumerable: false,
        confiugrable: true,
        value: matcher
      });
    }

    respond(exec) {
      var matcher = this._matcher,
          result  = matcher.exec(this.getParser(), this.getSourceRange());

      if (!result || result === false)
        return this.skip();

      return this.success(result);
    }
  };
});

module.exports = {
  $OPTIONAL
};
