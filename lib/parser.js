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
        enumerable:   true,
        configurable: true,
        value:        (Utils.isType(options.inputStream, InputStream, 'InputStream')) ? options.inputStream : new InputStream(options),
      },
    });
  }

  getInputStream() {
    return this.inputStream;
  }

  resolveResult(context, result) {
    let value = result.panic;
    if (value)
      throw value;

    value = result.failed;
    if (value)
      return { success: false, result: context.prepareError('Failed to match') };

    value = result.token;
    if (value)
      return { success: true, result: value };

    value = result.value;
    if (value)
      return { success: true, result: value };

    return { success: false, result: context.prepareError('Empty result') };
  }

  async exec(matcher, contextProperties) {
    let parserContext = new ParserContext({
      parser:     this,
      parent:     null,
      properties: {
        debugColors: true,
        ...this.getOptions(),
        ...contextProperties,
      },
    });

    return this.resolveResult(parserContext, await parserContext.exec(matcher));
  }
});
