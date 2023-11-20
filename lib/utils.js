export const TYPE_SYMBOL      = Symbol.for('/adextopa/types/type');
export const VIRTUAL_RESOLVER = Symbol.for('/adextopa/helper/virtualResolver');

export const COMPARE_FAILURE        = -1;
export const COMPARE_OUT_OF_BOUNDS  = -2;

const SAFE_ARRAY_ACCESS       = (/^(\d+|length)$/);
const IS_CLASS                = (/^class \S+ \{/);
const IS_CLASS_STRING_TAG     = (/^\[object ([^\s\]]+)\]$/);
const NATIVE_CLASS_TYPE_NAMES = [
  'AggregateError',
  'Array',
  'ArrayBuffer',
  'BigInt',
  'BigInt64Array',
  'BigUint64Array',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'FinalizationRegistry',
  'Float32Array',
  'Float64Array',
  'Function',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'Map',
  'Number',
  'Object',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  'SharedArrayBuffer',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'Uint16Array',
  'Uint32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'URIError',
  'WeakMap',
  'WeakRef',
  'WeakSet',
];

const NATIVE_CLASS_TYPES = NATIVE_CLASS_TYPE_NAMES.map((typeName) => globalThis[typeName]).filter(Boolean);

export function isValidNumber(value) {
  if (Object.is(value, NaN) || Object.is(value, Infinity) || Object.is(value, -Infinity))
    return false;

  return isType(value, 'Number');
}

export function isPlainObject(value) {
  if (!value)
    return false;

  if (typeof value !== 'object')
    return false;

  if (value.constructor === Object || value.constructor == null)
    return true;

  return false;
}

export function isPrimitive(value) {
  if (value == null || Object.is(value, NaN))
    return false;

  if (typeof value === 'symbol')
    return false;

  if (Object.is(value, Infinity) || Object.is(value, -Infinity))
    return false;

  return isType(value, 'String', 'Number', 'Boolean');
}

export function isSerializable(value) {
  if (value === null)
    return true;

  if (value === undefined || Object.is(value, NaN))
    return false;

  if (typeof value === 'symbol')
    return false;

  if (Object.is(value, Infinity) || Object.is(value, -Infinity))
    return false;

  if (isType(value, 'String', 'Number', 'Boolean'))
    return true;

  if (isPlainObject(value))
    return true;

  if (Array.isArray(value))
    return true;

  return (value && typeof value.toJSON === 'function');
}

export function cloneRegExp(regexp, _forceFlags, _disallowFlags) {
  let forceFlags    = _forceFlags;
  let disallowFlags = _disallowFlags;

  if (typeof forceFlags === 'string' || forceFlags instanceof String)
    forceFlags = ('' + forceFlags).toLowerCase().split('');

  if (typeof disallowFlags === 'string' || disallowFlags instanceof String)
    disallowFlags = ('' + disallowFlags).toLowerCase().split('');

  const getFlags = (_flags) => {
    let flags = (_flags || '').split('').map((p) => p.toLowerCase());

    if (disallowFlags && disallowFlags.length > 0)
      flags = flags.filter((flag) => (disallowFlags.indexOf(flag) < 0));

    if (forceFlags && forceFlags.length > 0) {
      for (let i = 0, il = forceFlags.length; i < il; i++) {
        let forceFlag = forceFlags[i];
        if (flags.indexOf(forceFlag) < 0)
          flags.push(forceFlag);
      }
    }

    return flags.sort().join('');
  };

  return new RegExp(regexp.source, getFlags(regexp.flags));
}

export function fetch(path, defaultValue) {
  if (!this)
    return defaultValue;

  let pathParts = (Array.isArray(path)) ? path : ((path && typeof path.split === 'function' && path.split('.')) || []);
  let key       = pathParts.shift();
  if (key == null)
    return defaultValue;

  let value;
  if (this !== global && isPlainObject(this) && Object.prototype.hasOwnProperty.call(this, key))
    value = this[key];
  else if (Array.isArray(this) && SAFE_ARRAY_ACCESS.test(key))
    value = this[key];
  else if (typeof this === 'function' && key === 'name')
    value = this.name;
  else if (typeof this.get === 'function')
    value = this.get(key);
  else if (this !== global && Object.prototype.hasOwnProperty.call(this, key) && !(key in Object.prototype))
    value = this[key];

  if (value == null)
    return defaultValue;

  if (pathParts.length === 0)
    return value;

  return fetch.call(value, pathParts, defaultValue);
}

export function typeOf(value) {
  if (value == null || Object.is(value, NaN))
    return 'undefined';

  if (Object.is(value, Infinity) || Object.is(value, -Infinity))
    return 'Number';

  if (value[TYPE_SYMBOL])
    return value[TYPE_SYMBOL];

  let thisType = typeof value;
  if (thisType === 'bigint')
    return 'BigInt';

  if (thisType !== 'object') {
    if (thisType === 'function') {
      let nativeTypeIndex = NATIVE_CLASS_TYPES.indexOf(value);
      if (nativeTypeIndex >= 0)
        return `[Class ${NATIVE_CLASS_TYPE_NAMES[nativeTypeIndex]}]`;

      if (value.prototype && typeof value.prototype.constructor === 'function' && IS_CLASS.test('' + value.prototype.constructor))
        return `[Class ${value.name}]`;

      let result = ('' + value.prototype).match(IS_CLASS_STRING_TAG);
      if (result && result[1] !== 'Object')
        return `[Class ${result[1]}]`;
    }

    return `${thisType.charAt(0).toUpperCase()}${thisType.substring(1)}`;
  }

  if (value instanceof String)
    return 'String';

  if (value instanceof Number)
    return 'Number';

  if (value instanceof Boolean)
    return 'Boolean';

  if (isPlainObject(value))
    return 'Object';

  return value.constructor.name || 'Object';
}

export function isType(value, ...types) {
  let valueType = typeOf(value);
  if (types.indexOf(valueType) >= 0)
    return true;

  return types.some((type) => (typeof type === 'function' && value instanceof type));
}

export function makeKeysNonEnumerable(value) {
  // Make static members non-enumberable
  Object.keys(value).forEach((propertyName) => {
    Object.defineProperties(value, {
      [propertyName]: {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        value[propertyName],
      },
    });
  });

  return value;
}

export function nonEnumerableAssign(target, ...args) {
  let tempTarget  = Object.assign({}, ...args);
  let keys        = Object.keys(tempTarget);

  for (let i = 0, il = keys.length; i < il; i++) {
    let key   = keys[i];
    let value = tempTarget[key];

    Object.defineProperty(target, key, {
      writable:     true,
      enumerable:   false,
      configurable: true,
      value:        value,
    });
  }

  return target;
}

export function assign(target, ...args) {
  for (let i = 0, il = args.length; i < il; i++) {
    let arg = args[i];

    iterate(arg, (key, value) => {
      if (typeof target.set === 'function')
        target.set(key, value);
      else
        target[key] = value;
    });
  }

  return target;
}

export function iterate(obj, callback) {
  if (!obj)
    return [];

  let results = [];
  if (typeof obj.entries === 'undefined') {
    let keys = Object.keys(obj);
    for (let i = 0, il = keys.length; i < il; i++) {
      let key   = keys[i];
      let value = obj[key];

      results.push(callback(key, value, i));
    }
  } else {
    let index = 0;
    for (let [ key, value ] of obj.entries())
      results.push(callback(key, value, index++));
  }

  return results;
}

export function sizeOf(value) {
  if (!value)
    return 0;

  if (isType(value, 'Boolean', 'Number', 'BigInt', 'undefined'))
    return 0;

  if (Array.isArray(value))
    return value.length;

  if (isType(value, 'String'))
    return value.length;

  if (isType(value.length, 'Number'))
    return value.length;

  return Object.keys(value).length;
}

export function noe(value) {
  if (value == null)
    return true;

  if (Object.is(value, NaN))
    return true;

  if (value === '')
    return true;

  if (isType(value, 'String') && (/^[\s\r\n]*$/).test(value))
    return true;

  return false;
}

// Many thanks to Bud Damyanov for the following
// table of escape sequences!
// https://stackoverflow.com/a/41407246

const COLOR_TABLE = {
  'reset':              '\x1b[0m',
  'effect:bright':      '\x1b[1m',
  'effect:dim':         '\x1b[2m',
  'effect:underscore':  '\x1b[4m',
  'effect:blink':       '\x1b[5m',
  'effect:reverse':     '\x1b[7m',
  'effect:hidden':      '\x1b[8m',

  'fg:black':           '\x1b[30m',
  'fg:red':             '\x1b[31m',
  'fg:green':           '\x1b[32m',
  'fg:yellow':          '\x1b[33m',
  'fg:blue':            '\x1b[34m',
  'fg:magenta':         '\x1b[35m',
  'fg:cyan':            '\x1b[36m',
  'fg:white':           '\x1b[37m',
  'fg:gray':            '\x1b[90m',

  'bg:black':           '\x1b[40m',
  'bg:red':             '\x1b[41m',
  'bg:green':           '\x1b[42m',
  'bg:yellow':          '\x1b[43m',
  'bg:blue':            '\x1b[44m',
  'bg:magenta':         '\x1b[45m',
  'bg:cyan':            '\x1b[46m',
  'bg:white':           '\x1b[47m',
  'bg:gray':            '\x1b[100m',
};

export function setStringColor(colorCommands, _content) {
  let content = _content;
  if (typeof content === 'symbol')
    content = content.toString();

  if (content == null)
    content = '';

  const getColorEscapeSequence = (colorCommands) => {
    return colorCommands
      .split(/;/g)
      .map((part) => part.trim())
      .map((part) => {
        if (!Object.prototype.hasOwnProperty.call(COLOR_TABLE, part))
          return '';

        return COLOR_TABLE[part];
      })
      .join('');
  };

  let escapeSequence = getColorEscapeSequence(colorCommands);
  return (content) ? `${escapeSequence}${content}${getColorEscapeSequence('reset')}` : escapeSequence;
}
