import { Matcher } from '../matcher.js';
import { Context } from './context.js';

export const Debug = Matcher.createMatcherMethod((matcher) => {
  return Context(matcher, { debug: true });
});

export const Silent = Matcher.createMatcherMethod((matcher) => {
  return Context(matcher, { debug: false });
});
