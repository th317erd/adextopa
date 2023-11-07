import { Context }  from './context.js';

export function Debug(matcher) {
  return Context(matcher, { debug: true });
}

export function Silent(matcher) {
  return Context(matcher, { debug: false });
}
