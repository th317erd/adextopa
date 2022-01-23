const { Token }         = require('../token');
const { defineMatcher } = require('../matcher-definition');
const { $PROGRAM }      = require('./program');
const { $OPTIONAL }     = require('./optional');

const $SELECT = defineMatcher('$SELECT', (ParentClass) => {
  return class SelectMatcher extends ParentClass {
    constructor(...args) {
      var { matchers, opts }  = $PROGRAM.getMatchersAndOptionsFromArguments(...args);
      var superArgs           = matchers.map($OPTIONAL).concat(
        Object.assign(
          { typeName: '$SELECT' },
          opts || {},
          { stopOnFirstMatch: true },
        )
      );

      super(...superArgs);
    }

    respond(...args) {
      var result = super.respond(...args);

      if (result instanceof Token) {
        if (result.skipOutput())
          return result;

        return result.children[0];
      }

      return result;
    }
  };
}, $PROGRAM);

module.exports = {
  $SELECT,
};
