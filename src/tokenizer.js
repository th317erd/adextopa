import TokenStream from './token-stream';
import { convertToTokenParser } from './parser-engine';

export default class Tokenizer {
  constructor(token, _opts) {
    var opts = _opts || {};

    this.token = convertToTokenParser(token);
    this.options = opts;
  }

  parse(input, cb) {
    var src = new TokenStream(input),
        ret = this.token.call(src);
    
    if (ret instanceof Promise) {
      ret.then((result) => {
        cb.call(this, null, result)
      }, (err) => {
        cb.call(this, err, null)
      });
    } else {
      cb.call(this, null, ret);
    }
  }
}
