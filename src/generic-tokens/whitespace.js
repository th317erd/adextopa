const { isType, isValidNumber } = require('../utils');
const { defineMatcher }         = require('../matcher-definition');

const $WS = defineMatcher('$WS', (ParentClass) => {
  return class WhitespaceMatcher extends ParentClass {
    constructor(opts) {
      var { max, min } = (opts || {});

      if (min != null && (!isType(min, 'number') || !isValidNumber(min))) {
        throw new TypeError(`$WS::constructor: "min" option must be a valid number`);
      } else {
        if (min == null)
          min = 1;

        if (min < 0)
          throw new Error(`$WS::constructor: "min" option must be greater than or equal to zero`);
      }

      if (max != null && (!isType(max, 'number') || !isValidNumber(max))) {
        throw new TypeError(`$WS::constructor: "max" option must be a valid number`);
      } else {
        if (max != null && max < 1)
          throw new Error(`$WS::constructor: "max" option must be greater than or equal to one`);
      }

      // Swap min and max, if both are set, and max is smaller than min
      if (min != null && max != null && max < min) {
        var temp = min;
        min = max;
        max = temp;
      }

      super(Object.assign({}, opts || {}, { max, min }));
    }

    clone(offset) {
      return super.clone(offset, [ Object.assign({}, this.getOptions()) ]);
    }

    respond(context) {
      var opts      = this.getOptions();
      var sourceStr = this.getSourceAsString();
      var offset    = this.startOffset;

      var {
        discard,
        max,
        min,
        newLines,
        optional,
      } = opts;

      if (opts.debugInspect)
        debugger;

      for (var i = 0, len = sourceStr.length; offset < len; i++, offset++) {
        if (max && i >= max)
          break;

        var char = sourceStr.charAt(offset);
        if (char === ' ' || char === '\t')
          continue;

        if (newLines !== false && (char === '\n' || char === '\r'))
          continue;

        break;
      }

      if (offset === this.startOffset || i < min) {
        if (optional)
          return this.skip(context);

        return this.fail(context);
      }

      // "discard" by skipping this range
      if (discard)
        return this.skip(context, offset);

      return this.success(context, offset, { value: sourceStr.substring(this.startOffset, offset) });
    }
  };
});

module.exports = {
  $WS,
};
