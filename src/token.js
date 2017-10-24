import { definePropertyRO, definePropertyRW, noe, isValidNum } from './utils';
import Position from './position';

export default class Token {
  constructor(_opts) {
    var opts = _opts || {},
        type = opts.type || this.constructor.name,
        source = opts.source,
        position = opts.position,
        value = opts.value;

    if (noe(type, source, position)) {
      console.log("ERRROR:", type, source, position);
      throw new Error('"type", "source", and "position" are required attributes when rejecting a token');
    }

    position = (isValidNum(position)) ? new Position(source.offset, source.offset + position) : position;

    definePropertyRW(this, 'type', type);
    definePropertyRW(this, 'source', source);
    definePropertyRW(this, 'position', position);
    definePropertyRW(this, 'value', value);
    definePropertyRW(this, 'rawValue', value);
    definePropertyRW(this, 'success', (opts.hasOwnProperty('success')) ? !!opts.success : !!value);

    if (this.position instanceof Number || typeof this.position === 'number')
      throw new Error('Can not be a number!');

    var keys = Object.keys(opts);
    for (var i = 0, il = keys.length; i < il; i++) {
      var key = keys[i];
      if (key === 'type' || key === 'source' || key === 'value' || key === 'success' || key === 'position')
        continue;

      this[key] = opts[key];
    }
  }

  toString() {
    return (this.value || this.rawValue).toString();
  }
}

export function NULL(pos) {
  return new Token({
    type: 'NULL',
    source: this,
    position: pos || this.position(),
    value: null,
    success: false
  });
}

function newRawToken(type) {
  return function(value, pos) {
    return new Token({
      type,
      source: this,
      position: (pos === undefined)  ? this.position() : pos,
      value: value,
      success: true
    });
  };
}

export const  STRING = newRawToken('STRING'),
              NUMBER = newRawToken('NUMBER'),
              BOOLEAN = newRawToken('BOOLEAN'),
              ARRAY = newRawToken('ARRAY');
