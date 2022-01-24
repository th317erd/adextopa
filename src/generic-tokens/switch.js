const { Token }         = require('../token');
const { defineMatcher } = require('../matcher-definition');
const { $PROGRAM }      = require('./program');
const { $OPTIONAL }     = require('./optional');

const $SWITCH = defineMatcher('$SWITCH', (ParentClass) => {
  return class SelectMatcher extends ParentClass {
    constructor(...args) {
      var { matchers, opts }  = $PROGRAM.getMatchersAndOptionsFromArguments(...args);
      var superArgs           = matchers.map($OPTIONAL).concat(
        Object.assign(
          { typeName: '$SWITCH' },
          opts || {},
          { stopOnFirstMatch: true },
        )
      );

      super(...superArgs);
    }

    respond(context, ...args) {
      var newContext  = Object.assign(Object.create(context), { switch: true });
      var result      = super.respond(newContext, ...args);

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
  $SWITCH,
};
