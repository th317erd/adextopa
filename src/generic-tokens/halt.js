
const { isType }        = require('../utils');
const { defineMatcher } = require('../matcher-definition');

const $HALT = defineMatcher('$HALT', (ParentClass) => {
  return class DiscardMatcher extends ParentClass {
    constructor(parentToStop, _opts) {
      var opts = _opts || {};
      if (isType(_opts, 'string'))
        opts = { typeName: opts };

      super(Object.assign({ debugSkip: true }, opts || {}, { parentToStop }));
    }

    clone(offset) {
      return super.clone(offset, []);
    }

    respond(context) {
      var opts = this.getOptions();

      if (!context.enforce)
        context.stop(opts.parentToStop || [ '$PROGRAM', '$SWITCH' ]);

      return this.skip(context);
    }
  };
});

module.exports = {
  $HALT,
};
