import { MapResult } from './map-result.js';

export function ProxyChildren(matcher) {
  return MapResult(matcher, ({ context, matcherName }, { token }) => {
    if (token) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Proxying captured token children.`, token);
      token.proxyChildren(true);
    } else {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Passing unhandled result upstream.`);
    }
  }).name('ProxyChildren');
}
