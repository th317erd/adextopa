import { Matcher } from '../matcher.js';
import { Context } from './context.js';

export const Debug = Matcher.createMatcherMethod((_, matcher) => {
  return Context(matcher, { debug: true });
});

export const Silent = Matcher.createMatcherMethod((_, matcher) => {
  return Context(matcher, { debug: false });
});
