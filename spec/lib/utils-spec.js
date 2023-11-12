/* eslint-disable no-magic-numbers */

import {
  Utils,
} from '../../lib/index.js';

describe('Utils', () => {
  it('cloneRegExp works', async () => {
    const test = (regexp, forceFlags, disallowFlags) => {
      let result = Utils.cloneRegExp(regexp, forceFlags, disallowFlags);
      expect(result !== regexp).toBe(true);
      return { source: result.source, flags: result.flags };
    };

    expect(test(/hello/)).toEqual({ source: 'hello', flags: '' });
    expect(test(/hello/g)).toEqual({ source: 'hello', flags: 'g' });
    expect(test(/hello/, [ 'g' ])).toEqual({ source: 'hello', flags: 'g' });
    expect(test(/hello/, [ 'i', 'g' ])).toEqual({ source: 'hello', flags: 'gi' });
    expect(test(/hello/i, [ 'g' ])).toEqual({ source: 'hello', flags: 'gi' });
    expect(test(/hello/ig, [ 'g' ], [ 'g' ])).toEqual({ source: 'hello', flags: 'gi' });
    expect(test(/hello/ig, [ 'g' ], [ 'i' ])).toEqual({ source: 'hello', flags: 'g' });
    expect(test(/hello/ig, null, [ 'i', 'g' ])).toEqual({ source: 'hello', flags: '' });
    expect(test(/hello/ig, null, 'ig')).toEqual({ source: 'hello', flags: '' });
    expect(test(/hello/ig, 'mi', 'ig')).toEqual({ source: 'hello', flags: 'im' });
  });
});
