import { noe, isValidNum } from './utils';

export default class Position {
  constructor(s, e) {
    var _start,
        _end;

    if (arguments.length === 1) {
      if (s instanceof Position) {
        _start = s.rawStart;
        _end = s.rawEnd;
      } else if (isValidNum(s)) {
        _start = s;
      }
    } else if (arguments.length === 2) {
      if (s instanceof Position)
        _start = s.start;
      else if (isValidNum(s))
        _start = s;

      if (e instanceof Position)
        _end = e.end;
      else if (isValidNum(e))
        _end = e;
    }

    Object.defineProperty(this, 'length', {
      enumerable: false,
      configurable: false,
      get: () => (this.end - this.start),
      set: () => {}
    });

    Object.defineProperty(this, 'rawStart', {
      enumerable: true,
      configurable: false,
      get: () => _start,
      set: (val) => _start = val
    });

    Object.defineProperty(this, 'rawEnd', {
      enumerable: true,
      configurable: false,
      get: () => _end,
      set: (val) => _end = val
    });

    Object.defineProperty(this, 'start', {
      enumerable: true,
      configurable: false,
      get: () => {
        if (_start === undefined)
          return (_end === undefined) ? 0 : _end;
        return (_start > _end) ? _end : _start;
      },
      set: (val) => _start = val
    });

    Object.defineProperty(this, 'end', {
      enumerable: true,
      configurable: false,
      get: () => {
        if (_end === undefined)
          return (_start === undefined) ? 0 : _start;
        return (_end < _start) ? _start : _end;
      },
      set: (val) => _end = val
    });
  }

  toString() {
    return '{ start: ' + this.start + ', end: ' + this.end + ' }';
  }

    // function smallest() {
    //   for (var num, i = 0, il = arguments.length; i < il; i++) {
    //     var x = arguments[i];
    //     if (isValidNum(x) && (num === undefined || x < num))
    //       num = x;
    //   }

    //   return num;
    // }

    // function largest() {
    //   for (var num, i = 0, il = arguments.length; i < il; i++) {
    //     var x = arguments[i];
    //     if (isValidNum(x) && (num === undefined || x > num))
    //       num = x;
    //   }

    //   return num;
    // }

    // function getPosition(_position, length) {
    //   if (_position === undefined)
    //     return;

    //   var position = _position;
    //   if (_position !== undefined) {
    //     if (_position instanceof Position) {
    //       position = _position;
    //     } else if ((_position instanceof Number || typeof _position === 'number') && !isNaN(_position) && isFinite(_position)) {
    //       if (_position < 0 && length !== undefined)
    //         position = length + _position;
    //       else
    //         position = _position;
    //     }
    //   }

    //   return position;
    // }
    
    // var start = getPosition(_start, _length),
    //     end = getPosition(_end, _length);

    // if (start instanceof Position) {
    //   if (!end)
    //     end = start.end;
    //   start = start.start;
    // }

    // if (end instanceof Position)
    //   end = (noe(end.end)) ? end.start : end.end;

    // this.start = start;
    // this.end = end;

  // length() {
  //   return this.end - this.start;
  // }

  // next() {
  //   return this.end;
  // }

  // clone() {
  //   return new Position(this.start, this.end);
  // }

  // equal(pos) {
  //   return (pos && pos.start === this.start && pos.end === this.end);
  // }

  // range(pos) {
  //   var min = this.start,
  //       max = this.end || this.start;
    
  //   if (pos === undefined || pos === null)
  //     return max - min;

  //   if ((typeof pos === 'number' || pos instanceof Number)) {
  //     if (pos < min)
  //       min = pos;

  //     if (pos > max)
  //       max = pos;
  //   } else {
  //     if (pos.start < min)
  //       min = pos.start;

  //     if (pos.start > max)
  //       max = pos.start;

  //     if (pos.end && pos.end > max)
  //       max = pos.end;
  //   }
      
  //   return max - min;
  // }
};
