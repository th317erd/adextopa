import { Matcher }    from '../matcher.js';
import { MapResult }  from './map-result.js';

export const Pin = Matcher.createMatcherMethod((matcher) => {
  return MapResult(matcher, (_, result) => {
    return result.setCapturedRange(null).setMatchedRange(null);
  });
});

export const PinCaptured = Matcher.createMatcherMethod((matcher) => {
  return MapResult(matcher, (_, result) => {
    return result.setCapturedRange(null);
  });
});

export const PinMatched = Matcher.createMatcherMethod((matcher) => {
  return MapResult(matcher, (_, result) => {
    return result.setMatchedRange(null);
  });
});
