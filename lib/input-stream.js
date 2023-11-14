import * as Utils   from './utils.js';
import { TypeBase } from './type-base.js';

export const InputStream = Utils.makeKeysNonEnumerable(class InputStream extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'InputStream';

  constructor(options) {
    super(options);
  }

  sizeInChars() {
    return this.toString().length;
  }

  getFileName() {
    let options = this.getOptions();
    return options.fileName || '';
  }

  toString() {
    let options = this.getOptions();
    return options.source || '';
  }

  slice(start, end) {
    if (arguments.length > 1)
      return this.toString().substring(start, end);

    let range = start;
    return this.toString().substring(range.start, range.end);
  }

  indexOf(value, offset) {
    return this.toString().indexOf(value, offset);
  }

  compare(range, pattern) {
    return (this.indexOf(pattern, range.start) === range.start);
  }

  getLineAtOffset(offset) {
    let lineCount = this.slice(0, offset).split(/\r\n|\r|\n/g).length;
    return lineCount;
  }

  getColumnAtOffset(offset) {
    let lines     = this.slice(0, offset).split(/\r\n|\r|\n/g);
    let lastLine  = lines[lines.length - 1] || '';

    return lastLine.length + 1;
  }
});
