import { createHash }   from 'node:crypto';
import * as Util        from 'node:util';

const INSPECT_OPTIONS = {
  depth:            Infinity,
  colors:           false,
  maxArrayLength:   Infinity,
  maxStringLength:  Infinity,
  breakLength:      Infinity,
  compact:          false,
  sorted:           true,
  getters:          false,
  numericSeparator: false,
};

export function MD5(data) {
  let hash = createHash('md5');
  hash.update(data);
  return hash.digest('hex');
}

export function snapshot(_content, debug) {
  const massageError = (content) => {
    if (content instanceof Error) {
      return Object.assign({
        message: content.message,
      }, content);
    }

    return content;
  };

  let convertedContent  = massageError(_content);
  let content           = Util.inspect(convertedContent, INSPECT_OPTIONS);

  let hash = MD5(content);
  if (debug === true) {
    let debugContent = Util.inspect(convertedContent, {
      ...INSPECT_OPTIONS,
      sorted: false,
      colors: true,
    });

    console.log(`[${hash}] => ${debugContent}`);
  }

  return hash;
}
