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
    let opts          = _opts || {};
    let parserContext = new ParserContext(this);

    if (opts === true)
      opts = { debug: true };

    Object.assign(
      parserContext,
      Object.assign({
        debug:        false,
        debugColors:  true,
      }, opts),
    );

    return await parserContext.tokenize(matcher);
  }
}
