import * as Utils         from './utils.js';
import { TypeBase }       from './type-base.js';
import { ParserContext }  from './parser-context.js';
import { InputStream }    from './input-stream.js';

export const Parser = Utils.makeKeysNonEnumerable(class Parser extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'Parser';

  constructor(_options) {
    let options = _options || {};

    super(options);

    Object.defineProperties(this, {
      'inputStream': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (options.inputStream instanceof InputStream) ? options.inputStream : new InputStream(options),
      },
    });
  }

  getInputStream() {
    return this.inputStream;
  }

  async exec(matcher, contextProperties) {
    let parserContext = new ParserContext(
      this,
      null,
      {
        properties: {
          debugColors: true,
          ...this.getOptions(),
          ...contextProperties,
        },
      },
    );

    return await parserContext.exec(matcher);
  }

  clone(_options) {
    let options = Object.assign(
      Object.create(this.getOptions()),
      _options || {},
    );

    if (!options.inputStream)
      options.inputStream = new InputStream(options);

    return new this.constructor(options);
  }
});
