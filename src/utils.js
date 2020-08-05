function isValidNumber(num) {
  if (num == null)
    return false;

  if (!(num instanceof Number || typeof num === 'number'))
    return false;

  return isFinite(num);
}

function isType(value) {
  for (var i = 1, il = arguments.length; i < il; i++) {
    var type      = arguments[i],
        typeCheck = isType._typeCheckers[type];

    if (typeof typeCheck !== 'function')
      continue;

    if (typeCheck.call(this, value))
      return true;
  }

  return false;
}

isType.addType = function addType(typeName, checker) {
  isType._typeCheckers[typeName] = checker;
}

isType._typeCheckers = {
  'string':   (val) => (typeof val === 'string' || val instanceof String),
  'number':   (val) => (typeof val === 'number' || val instanceof Number),
  'boolean':  (val) => (typeof val === 'boolean' || val instanceof Boolean),
  'bigint':   (val) => (typeof val === 'bigint'),
  'array':    (val) => ((typeof Array.isArray === 'function') ? Array.isArray(val) : (val instanceof Array)),
  'object':   (val) => (val.constructor === Object),
  'function': (val) => ((typeof val === 'function' || val instanceof Function) && !(/^class\s+/).test(val.toString())),
  'class':    (val) => ((typeof val === 'function' || val instanceof Function) && (/^class\s+/).test(val.toString())),
  'RegExp':   (val) => (val instanceof RegExp)
};

function addRegExpFlags(re, _flags) {
  var isRE    = (re instanceof RegExp),
      flags   = (isRE) ? (re.flags + (_flags || '')) : _flags;

  // Ensure flags are unique
  flags = Object.keys(flags.split('').reduce((obj, flag) => (obj[flag] = obj), {})).join('');

  return new RegExp((isRE) ? re.source : re, flags);
}

module.exports = {
  isValidNumber,
  isType,
  addRegExpFlags
};
