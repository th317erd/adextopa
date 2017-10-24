'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STRING_TOKEN_STREAM = exports.ARRAY_TOKEN_STREAM = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _position2 = require('./position');

var _position3 = _interopRequireDefault(_position2);

var _token = require('./token');

var _token2 = _interopRequireDefault(_token);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ARRAY_TOKEN_STREAM = exports.ARRAY_TOKEN_STREAM = 1,
    STRING_TOKEN_STREAM = exports.STRING_TOKEN_STREAM = 2;

var TokenStream = function () {
  function TokenStream(content) {
    var _this = this;

    _classCallCheck(this, TokenStream);

    (0, _utils.definePropertyRW)(this, '__stringCacheInvalid', true);
    (0, _utils.definePropertyRW)(this, '__stringCache', '');
    (0, _utils.definePropertyRW)(this, '__eos', false);

    var tokens, position;

    if (typeof content === 'string' || content instanceof String) {
      tokens = content;

      this._stringCache = content;
      this._stringCacheInvalid = false;
    } else if (content instanceof TokenStream) {
      tokens = content._tokens;
      position = new _position3.default(content.position());
    } else if (content instanceof Array) {
      tokens = content.slice();
    } else {
      tokens = [];
    }

    (0, _utils.definePropertyRW)(this, '__tokensType', tokens instanceof Array ? ARRAY_TOKEN_STREAM : STRING_TOKEN_STREAM);
    (0, _utils.definePropertyRW)(this, '__position', !position ? new _position3.default(0, 0) : position);
    (0, _utils.definePropertyRW)(this, '__tokens', tokens);

    Object.defineProperty(this, 'length', {
      enumerable: false,
      configurable: false,
      get: function get() {
        return _this._tokens.length;
      },
      set: function set() {}
    });

    Object.defineProperty(this, 'offset', {
      enumerable: false,
      configurable: false,
      get: function get() {
        return _this._position.start;
      },
      set: function set() {}
    });
  }

  _createClass(TokenStream, [{
    key: 'toString',
    value: function toString() {
      if (this._stringCacheInvalid) {
        this._stringCacheInvalid = false;

        var stringCache;
        if (this._tokensType === STRING_TOKEN_STREAM) stringCache = this._stringCache = this._tokens;else stringCache = this._stringCache = (this._tokens || []).map(function (result) {
          return result.toString();
        }).join('');

        return stringCache;
      } else {
        return this._stringCache;
      }
    }
  }, {
    key: 'push',
    value: function push(token) {
      this._stringCacheInvalid = true;
      this._tokens.push(token);
    }
  }, {
    key: 'seek',
    value: function seek(_position) {
      this._position = new _position3.default(_position);
    }
  }, {
    key: 'seekRaw',
    value: function seekRaw(_position) {
      //TODO: In the future handle raw chars / vs tokens
      this.seek(_position);
    }
  }, {
    key: 'tokens',
    value: function tokens() {
      return this._tokens || [];
    }
  }, {
    key: 'substr',
    value: function substr(start, length) {
      var str = this.toString();
      return str.substr(start, length);
    }
  }, {
    key: 'position',
    value: function position() {
      return this._position;
    }
  }, {
    key: 'get',
    value: function get(_position) {
      var position;

      if (arguments.length === 0) {
        if (this._tokensType === STRING_TOKEN_STREAM) return this._tokens.charAt(this._position.start++);
        return this._tokens[this._position.start++];
      } else {
        position = new _position3.default(_position);
      }

      if (position.end === position.start) {
        position = position.start;
        if (position >= this._position.start) this._position.start++;

        if (this._tokensType === STRING_TOKEN_STREAM) return this._tokens.charAt(position);
        return this._tokens[position];
      }

      if (position.end >= this._position.start) this._position.start = position.end;

      if (this._tokensType === STRING_TOKEN_STREAM) return new TokenStream(this._tokens.substring(position.start, position.end));

      return new TokenStream(this._tokens.slice(position.start, position.end));
    }
  }, {
    key: 'eof',
    value: function eof() {
      return this._position.start >= this._tokens.length;
    }
  }, {
    key: 'close',
    value: function close(set) {
      if (arguments.length > 0) this._eos = !!set;

      return this._eos;
    }
  }, {
    key: 'raise',
    value: function raise(err) {}
  }, {
    key: 'NULL',
    value: function NULL() {
      for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      return _token.NULL.call.apply(_token.NULL, [this].concat(params));
    }
  }]);

  return TokenStream;
}();

exports.default = TokenStream;
;