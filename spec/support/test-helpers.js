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
  let content = Util.inspect(_content, INSPECT_OPTIONS);

  let hash = MD5(content);
  if (debug === true) {
    let debugContent = Util.inspect(_content, {
      ...INSPECT_OPTIONS,
      colors: true,
    });

    console.log(`[${hash}] => ${debugContent}`);
  }

  return hash;
}
