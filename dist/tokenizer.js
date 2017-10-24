'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tokenStream = require('./token-stream');

var _tokenStream2 = _interopRequireDefault(_tokenStream);

var _parserEngine = require('./parser-engine');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tokenizer = function () {
  function Tokenizer(token, _opts) {
    _classCallCheck(this, Tokenizer);

    var opts = _opts || {};

    this.token = (0, _parserEngine.convertToTokenParser)(token);
    this.options = opts;
  }

  _createClass(Tokenizer, [{
    key: 'parse',
    value: function parse(input, cb) {
      var _this = this;

      var src = new _tokenStream2.default(input),
          ret = this.token.call(src);

      if (ret instanceof Promise) ret.then(function (result) {
        return cb.call(_this, null, result);
      }, function (err) {
        return cb.call(err, null);
      });else cb.call(this, null, ret);
    }
  }]);

  return Tokenizer;
}();

exports.default = Tokenizer;