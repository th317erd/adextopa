const { isType, isValidNumber } = require('../utils');
const { defineMatcher }         = require('../matcher-definition');

function buildRanges(str) {
  const constructRange = (_first, _last) => {
    var first = (_last < _first) ? _last : _first;
    var last  = (_last < _first) ? _first : _last;

    if (first === last)
      return '';

    var parts = new Array((last - first) + 1);
    for (var i = first; i <= last; i++)
      parts[i] = String.fromCharCode(i);

    return parts.join('');
  };

  return str.replace(/.-./g, function(m) {
    var firstCode   = m.charCodeAt(0);
    var secondCode  = m.charCodeAt(2);
    return constructRange(firstCode, secondCode);
  });
}

const $ANY = defineMatcher('$ANY', (ParentClass) => {
  return class AnyMatcher extends ParentClass {
    constructor(opts) {
      var { max, min, chars } = (opts || {});

      if (min != null && (!isType(min, 'number') || !isValidNumber(min))) {
        throw new TypeError(`$ANY::constructor: "min" option must be a valid number`);
      } else {
        if (min == null)
          min = 1;

        if (min < 0)
          throw new Error(`$ANY::constructor: "min" option must be greater than or equal to zero`);
      }

      if (max != null && (!isType(max, 'number') || !isValidNumber(max))) {
        throw new TypeError(`$ANY::constructor: "max" option must be a valid number`);
      } else {
        if (max != null && max < 1)
          throw new Error(`$ANY::constructor: "max" option must be greater than or equal to one`);
      }

      // Swap min and max, if both are set, and max is smaller than min
      if (min != null && max != null && max < min) {
        var temp = min;
        min = max;
        max = temp;
      }

      if (!isType(chars, 'string', 'array'))
        throw new Error(`$ANY::constructor: "chars" option must be a string or an array`);

      if (isType(chars, 'array'))
        chars = chars.filter((part) => (isType(part, 'string') && part.match(/\S/))).join('');

      chars = buildRanges(chars);

      super(Object.assign({}, opts || {}, { max, min, chars }));
    }

    clone(offset) {
      return super.clone(offset);
    }

    respond(context) {
      var opts      = this.getOptions();
      var sourceStr = this.getSourceAsString();
      var offset    = this.startOffset;

      var {
        discard,
        max,
        min,
        chars,
        optional,
      } = opts;

      chars = chars.split('');

      if (opts.debugInspect)
        debugger;

      for (var i = 0, len = sourceStr.length; offset < len; i++, offset++) {
        if (max && i >= max)
          break;

        var char = sourceStr.charAt(offset);
        if (chars.indexOf(char) >= 0)
          continue;

        break;
      }

      if (offset === this.startOffset || i < min) {
        if (optional)
          return this.skip(context, offset);

        return this.fail(context, offset);
      }

      // "discard" by skipping this range
      if (discard)
        return this.skip(context, offset);

      return this.success(context, offset, { value: sourceStr.substring(this.startOffset, offset) });
    }
  };
});

module.exports = {
  $ANY,
};
