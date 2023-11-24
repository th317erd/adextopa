import * as Utils   from './utils.js';
import { TypeBase } from './type-base.js';

export const InputStream = Utils.makeKeysNonEnumerable(class InputStream extends TypeBase {

  constructor(options) {
    super(options);

    Object.defineProperties(this, {
      'length': {
        enumerable:   false,
        configurable: true,
        get:          () => this.sizeInChars(),
      },
    });
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

  // Compare checks for a pattern match
  // at exactly "range.start". If the match
  // is not exactly at "range.start" then
  // compare will consider the match a failure.
  compare(range, pattern, ensureRangeBounds, returnRawResult) {
    if (Utils.isType(pattern, RegExp)) {
      pattern.lastIndex = range.start;

      let result = pattern.exec(this.toString());
      if (!result || result.index !== range.start)
        return Utils.COMPARE_FAILURE;

      if (ensureRangeBounds && pattern.lastIndex > range.end) {
        // We have success, but the match went beyond the
        // end of the range. Try again using "substring" to
        // enforce the end of the range. If we succeed this
        // time, we must have a repeating pattern that was
        // able to succeed within our boundaries. If not,
        // report to the caller that we went out of bounds.
        //
        // This check is secondary to the primary match above
        // because we do our best to always avoid "substring"
        // calls, as they are expensive. Better to be expensive
        // sometimes, instead of expensive all the time, right?

        pattern.lastIndex = range.start;
        result = pattern.exec(this.toString().substring(0, range.end) /* Expensive */);
        if (!result || result.index !== range.start) {
          // We had a success, now we have a failure.
          // Report -1 to tell the caller that we went
          // out of bounds.
          return Utils.COMPARE_OUT_OF_BOUNDS;
        }
      }

      return (returnRawResult) ? result : (pattern.lastIndex - range.start); // Success, return length of match
    } else {
      // No way a match is possible?
      if (range.start + pattern.length > range.end)
        return Utils.COMPARE_OUT_OF_BOUNDS; // Out of bounds

      // Use "startsWith" if available, since it
      // will stop scanning immediately on failure,
      // unlike indexOf, that will continue scanning
      // the remainder of the input (which is wasteful).
      if (String.prototype.startsWith)
        return (this.toString().startsWith(pattern, range.start)) ? pattern.length : Utils.COMPARE_FAILURE;

      return (this.indexOf(pattern, range.start) === range.start) ? pattern.length : Utils.COMPARE_FAILURE;
    }
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
