import { MapResult } from './map-result.js';

export function Pin(matcher) {
  return MapResult(matcher, (_, result) => {
    return result.setCapturedRange(null).setMatchedRange(null);
  });
}

export function PinCaptured(matcher) {
  return MapResult(matcher, (_, result) => {
    return result.setCapturedRange(null);
  });
}

export function PinMatched(matcher) {
  return MapResult(matcher, (_, result) => {
    return result.setMatchedRange(null);
  });
}
