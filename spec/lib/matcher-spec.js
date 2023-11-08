/* eslint-disable no-magic-numbers */

import {
  Matcher,
} from '../../lib/index.js';

describe('Matcher', () => {
  it('createHelper works', async () => {
    let helper = Matcher.createHelper(({ isAny, isAll, typeOf, args }) => {
      expect(isAny(args[0])).toBe(false);
      expect(isAll(args[0])).toBe(false);

      if (args.length === 0)
        return 'nothing';
      else if (args[0] == null)
        return 'empty';
      else if (Object.is(args[0], NaN))
        return 'nan';
      else if (Object.is(args[0], Infinity))
        return 'infinity';
      else if (isAny(args[0], typeOf('string', 'number', 'boolean', 'bigint', 'symbol')))
        return 'primitive';
      else if (isAll(args[0], Array.isArray, (value) => (value.length === 0)))
        return 'empty array';
      else if (isAll(args[0], Array.isArray, (value) => (value.length > 0)))
        return 'populated array';
      else
        return 'other';
    });

    expect(helper()).toEqual('nothing');
    expect(helper(true)).toEqual('primitive');
    expect(helper(0)).toEqual('primitive');
    expect(helper(0n)).toEqual('primitive');
    expect(helper('string')).toEqual('primitive');
    expect(helper(undefined)).toEqual('empty');
    expect(helper(null)).toEqual('empty');
    expect(helper(NaN)).toEqual('nan');
    expect(helper(Infinity)).toEqual('infinity');
    expect(helper([])).toEqual('empty array');
    expect(helper([ 1 ])).toEqual('populated array');
    expect(helper({})).toEqual('other');
  });

  it('createHelper.fetchArgs works', async () => {
    let helper = Matcher.createHelper(({ fetchArgs }) => {
      return fetchArgs(({ args, isAny, isAll, typeOf }) => {
        expect(isAny(args[0])).toBe(false);
        expect(isAll(args[0])).toBe(false);

        if (args.length === 0)
          return 'nothing';
        else if (args[0] == null)
          return 'empty';
        else if (Object.is(args[0], NaN))
          return 'nan';
        else if (Object.is(args[0], Infinity))
          return 'infinity';
        else if (isAny(args[0], typeOf('string', 'number', 'boolean', 'bigint', 'symbol')))
          return 'primitive';
        else if (isAll(args[0], Array.isArray, (value) => (value.length === 0)))
          return 'empty array';
        else if (isAll(args[0], Array.isArray, (value) => (value.length > 0)))
          return 'populated array';
        else
          return 'other';
      });
    });

    expect(helper()).toEqual('nothing');
    expect(helper(true)).toEqual('primitive');
    expect(helper(0)).toEqual('primitive');
    expect(helper(0n)).toEqual('primitive');
    expect(helper('string')).toEqual('primitive');
    expect(helper(undefined)).toEqual('empty');
    expect(helper(null)).toEqual('empty');
    expect(helper(NaN)).toEqual('nan');
    expect(helper(Infinity)).toEqual('infinity');
    expect(helper([])).toEqual('empty array');
    expect(helper([ 1 ])).toEqual('populated array');
    expect(helper({})).toEqual('other');
  });
});
