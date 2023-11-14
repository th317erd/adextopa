export const TYPE_SYMBOL          = Symbol.for('/adextopa/types/type');
export const TO_PRIMITIVE_SYMBOL  = Symbol.for('/adextopa/helper/toPrimitive');

const SAFE_ARRAY_ACCESS   = (/^(\d+|length)$/);
const IS_CLASS            = (/^class \S+ \{/);
const IS_CLASS_STRING_TAG = (/^\[object ([^\s\]]+)\]$/);
const NATIVE_CLASS_TYPES  = [
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
].map((typeName) => globalThis[typeName]).filter(Boolean);

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
      if (NATIVE_CLASS_TYPES.indexOf(value) >= 0)
        return 'Class';

      if (value.prototype && typeof value.prototype.constructor === 'function' && IS_CLASS.test('' + value.prototype.constructor))
        return 'Class';

      let result = ('' + value.prototype).match(IS_CLASS_STRING_TAG);
      if (result && result[1] !== 'Object')
        return 'Class';
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

  if (this.getFromScope('debugColors') === false)
    return ('' + content);

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
