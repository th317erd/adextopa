import * as Utils         from './utils.js';
import { TypeBase }       from './type-base.js';
import { ParserContext }  from './parser-context.js';
import { InputStream }    from './input-stream.js';
import { MatcherResult }  from './results/matcher-result.js';

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

  resolveResult(context, result) {
    let value = result.get(MatcherResult.PANIC);
    if (value)
      return { success: false, result: value };

    value = result.get(MatcherResult.FAILED);
    if (value)
      return { success: false, result: context.prepareError('Failed to match') };

    value = result.get(MatcherResult.TOKEN);
    if (value)
      return { success: true, result: value };

    return { success: false, result: context.prepareError('Empty result') };
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

    return this.resolveResult(parserContext, await parserContext.exec(matcher));
  }

  clone(_options) {
    let options = Object.assign(
      Object.create(null),
      this.getOptions(),
      _options || {},
    );

    if (!options.inputStream)
      options.inputStream = new InputStream(options);

    return new this.constructor(options);
  }
});
