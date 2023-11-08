import { Matcher }  from '../matcher.js';

export class NullMatcher extends Matcher {
  static name = 'Null';

  static isConsuming() {
    return false;
  }

  constructor(_opts) {
    let opts = _opts || {};
    super(opts);
  }

  exec(context) {
    this.debugLog(context, 'Null: Success.');
    return this.skipResult(context, 0);
  }
}

export function Null() {
  return new NullMatcher();
}
