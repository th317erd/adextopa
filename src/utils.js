function defineProperty(writable, parent, name, value) {
  Object.defineProperty(parent, (name.charAt(0) === '_') ? name.substring(1) : name, {
    writable: writable,
    configurable: false,
    enumerable: (name.charAt(0) !== '_'),
    value: value
  });
}

export const definePropertyRO = defineProperty.bind(this, false);
export const definePropertyRW = defineProperty.bind(this, true);

export function noe() {
  function isNOE(value) {
    if (value === null || value === undefined)
      return true;
  
    if ((typeof value === 'number' || value instanceof Number) && (isNaN(value) || !isFinite(value)))
      return true;
  
    if ((typeof value === 'string' || value instanceof String) && (value.length === 0 || value.trim().length === 0))
      return true;
  
    if (value instanceof Array && value.length === 0)
      return true;
  
    if (value.constructor === Object && Object.keys(value).length === 0)
      return true;

    return false;
  }

  for (var i = 0, il = arguments.length; i < il; i++) {
    var val = arguments[i];
    if (isNOE(val))
      return true;
  }

  return false;
}

export function isValidNum(num) {
  if (num === undefined || num === null)
    return false;

  if (!(num instanceof Number || typeof num === 'number'))
    return false;
  
  return (!isNaN(num) && isFinite(num));
}

export default {
  definePropertyRO,
  definePropertyRW,
  noe,
  isValidNum
};
