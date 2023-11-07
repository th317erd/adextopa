import { ParserContext }  from './parser-context.js';

export class Parser {
  constructor(_opts) {
    let opts = _opts || {};

    Object.defineProperties(this, {
      [Symbol.for('/adextopa/types/type')]: {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        'Parser',
      },
      'source': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.source || '',
      },
      'fileName': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.fileName || '',
      },
    });
  }

  getSource() {
    return this.source;
  }

  async tokenize(matcher, _opts) {
    let opts = _opts || {};
    if (opts === true)
      opts = { debug: true };

    let parserContext = new ParserContext(this, opts);
    return await parserContext.tokenize(matcher);
  }
}
