import { definePropertyRO, definePropertyRW } from './utils';
import Position from './position';
import Token, { NULL } from './token';

export const  ARRAY_TOKEN_STREAM = 1,
              STRING_TOKEN_STREAM = 2;

export default class TokenStream {
  constructor(content) {
    definePropertyRW(this, '__stringCacheInvalid', true);
    definePropertyRW(this, '__stringCache', '');
    definePropertyRW(this, '__eos', false);

    var tokens,
        position;

    if (typeof content === 'string' || content instanceof String) {
      tokens = content;

      this._stringCache = content;
      this._stringCacheInvalid = false;
    } else if (content instanceof TokenStream) {
      tokens = content._tokens;
      position = new Position(content.position());
    } else if (content instanceof Array) {
      tokens = content.slice();
    } else {
      tokens = [];
    }

    definePropertyRW(this, '__tokensType', (tokens instanceof Array) ? ARRAY_TOKEN_STREAM : STRING_TOKEN_STREAM);
    definePropertyRW(this, '__position', (!position) ? new Position(0, 0) : position);
    definePropertyRW(this, '__tokens', tokens);

    Object.defineProperty(this, 'length', {
      enumerable: false,
      configurable: false,
      get: () => this._tokens.length,
      set: () => {}
    });

    Object.defineProperty(this, 'offset', {
      enumerable: false,
      configurable: false,
      get: () => this._position.start,
      set: () => {}
    });
  }

  toString() {
    if (this._stringCacheInvalid) {
      this._stringCacheInvalid = false;

      var stringCache;
      if (this._tokensType === STRING_TOKEN_STREAM)
        stringCache = this._stringCache = this._tokens;
      else
        stringCache = this._stringCache = ((this._tokens || []).map((result) => result.toString())).join('');

      return stringCache;
    } else {
      return this._stringCache;
    }
  }

  push(token) {
    this._stringCacheInvalid = true;
    this._tokens.push(token);
  }

  seek(_position) {
    this._position = new Position(_position);
  }

  seekRaw(_position) {
    //TODO: In the future handle raw chars / vs tokens
    this.seek(_position);
  }

  tokens() {
    return (this._tokens || []);
  }

  substr(start, length) {
    var str = this.toString();
    return str.substr(start, length);
  }

  position() {
    return this._position;
  }

  get(_position) {
    var position;

    if (arguments.length === 0) {
      if (this._tokensType === STRING_TOKEN_STREAM)
        return this._tokens.charAt(this._position.start++);
      return this._tokens[this._position.start++];
    } else {
      position = new Position(_position);
    }

    if (position.end === position.start) {
      position = position.start;
      if (position >= this._position.start)
        this._position.start++;

      if (this._tokensType === STRING_TOKEN_STREAM)
        return this._tokens.charAt(position);
      return this._tokens[position];
    }

    if (position.end >= this._position.start)
      this._position.start = position.end;
    
    if (this._tokensType === STRING_TOKEN_STREAM)
      return new TokenStream(this._tokens.substring(position.start, position.end));

    return new TokenStream(this._tokens.slice(position.start, position.end));
  }

  eof() {
    return (this._position.start >= this._tokens.length);
  }

  close(set) {
    if (arguments.length > 0)
      this._eos = !!set;

    return this._eos;
  }

  raise(err) {

  }

  NULL(...params) {
    return NULL.call(this, ...params);
  }
};
