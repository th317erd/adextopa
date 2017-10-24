'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ARRAY = exports.BOOLEAN = exports.NUMBER = exports.STRING = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.NULL = NULL;

var _utils = require('./utils');

var _position = require('./position');

var _position2 = _interopRequireDefault(_position);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = function () {
  function Token(_opts) {
    _classCallCheck(this, Token);

    var opts = _opts || {},
        type = opts.type || this.constructor.name,
        source = opts.source,
        position = opts.position,
        value = opts.value;

    if ((0, _utils.noe)(type, source, position)) {
      console.log("ERRROR:", type, source, position);
      throw new Error('"type", "source", and "position" are required attributes when rejecting a token');
    }

    position = (0, _utils.isValidNum)(position) ? new _position2.default(source.offset, source.offset + position) : position;

    (0, _utils.definePropertyRW)(this, 'type', type);
    (0, _utils.definePropertyRW)(this, 'source', source);
    (0, _utils.definePropertyRW)(this, 'position', position);
    (0, _utils.definePropertyRW)(this, 'value', value);
    (0, _utils.definePropertyRW)(this, 'rawValue', value);
    (0, _utils.definePropertyRW)(this, 'success', opts.hasOwnProperty('success') ? !!opts.success : !!value);

    if (this.position instanceof Number || typeof this.position === 'number') throw new Error('Can not be a number!');

    var keys = Object.keys(opts);
    for (var i = 0, il = keys.length; i < il; i++) {
      var key = keys[i];
      if (key === 'type' || key === 'source' || key === 'value' || key === 'success' || key === 'position') continue;

      this[key] = opts[key];
    }
  }

  _createClass(Token, [{
    key: 'toString',
    value: function toString() {
      return (this.value || this.rawValue).toString();
    }
  }]);

  return Token;
}();

exports.default = Token;
function NULL(pos) {
  return new Token({
    type: 'NULL',
    source: this,
    position: pos || this.position(),
    value: null,
    success: false
  });
}

function newRawToken(type) {
  return function (value, pos) {
    return new Token({
      type: type,
      source: this,
      position: pos === undefined ? this.position() : pos,
      value: value,
      success: true
    });
  };
}

var STRING = exports.STRING = newRawToken('STRING'),
    NUMBER = exports.NUMBER = newRawToken('NUMBER'),
    BOOLEAN = exports.BOOLEAN = newRawToken('BOOLEAN'),
    ARRAY = exports.ARRAY = newRawToken('ARRAY');