import { Matcher } from '../../../matcher.js';

import {
  Matches,
  Sequence,
  TrimValue,
} from '../../../matchers/index.js';

export const LineComment = Matcher.createMatcherMethod(() => {
  return TrimValue(Matches(/\/\/(?<value>[^\r\n]*)(?:\r\n|\r|\n)?/).name('Comment').suppressIndices(true));
});

export const BlockComment = Matcher.createMatcherMethod(() => {
  return TrimValue(Sequence('/*', '*/').name('Comment'));
});
