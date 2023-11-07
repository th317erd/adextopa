import { Matcher }  from '../matcher.js';

export class NullMatcher extends Matcher {
  static name = 'Null';

  constructor(_opts) {
    let opts = _opts || {};

    super({
      ...opts,
      consuming: false,
    });
  }

  exec(context) {
    this.debugLog(context, 'Null: Success.');
    return this.skipResult(context, 0);
  }
}

export function Null() {
  return new NullMatcher();
}
