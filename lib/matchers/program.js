import { Matcher }      from '../matcher.js';
import { LoopMatcher }  from './loop.js';

export class ProgramMatcher extends LoopMatcher {
  static name = 'Program';

  constructor(_opts) {
    let opts = _opts || {};

    super({
      ...opts,
      startIndex: 0,
      endIndex:   1,
      step:       1,
    });
  }
}

export function Program(/* name?, ...matchers */) {
  let args = Array.from(arguments);
  let name = args[0];

  if (typeof name === 'string' || Matcher.isVirtual(name))
    args = args.slice(1);
  else
    name = undefined;

  return new ProgramMatcher({
    name,
    matchers: args,
  });
}
