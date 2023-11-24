/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Utils,
  Parser,
  Matchers,
  Token,
} from '../../../lib/index.js';

const {
  Program,
  Equals,
  Fetch,
  Store,
  Switch,
  Cast,
  Call,
} = Matchers;

describe('/Core/Matchers/Fetch and Store', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Testing Testing' });
  });

  it('works', async () => {
    let result = await parser.exec(
      Program(
        Store('Value', 'Testing'),
        Store('CapturedValue', Equals(Fetch('Value')).name('First')),
        Equals(' ').name('Space'),
        Equals(Fetch('CapturedValue')).name('Second'),
      ).name('Program'),
    );

    expect(result).toMatchSnapshot();
  });

  it('works with tokens directly', async () => {
    parser = new Parser({ source: 'Testing Derp' });

    let result = await parser.exec(
      Program(
        Store('Value', 'Testing'),
        Store('CapturedValue', Equals(Fetch('Value')).name('First')),
        Fetch('CapturedValue'),
      ).name('Program'),
    );

    // _TestHelpers.inspectLog(result);

    expect(result).toMatchSnapshot();
  });

  it('works with current scope', async () => {
    let result = await parser.exec(
      Program(
        Switch(Fetch('_')),
      ).name('Program'),
    );

    // _TestHelpers.inspectLog(result);

    expect(result).toMatchSnapshot();
  });

  describe('Cast', () => {
    it('works', async () => {
      let tested = {};

      parser = new Parser({ source: 'Testing Derp' });

      let testToken = new Token({ attributes: { name: 'Test', value: 'Cast' } });

      class ExpandedTokenClass extends Token {}

      await parser.exec(
        Program(
          Store('String1', Cast('String', 1234)),
          Store('Number1', Cast('Number', '1234')),
          Store('Number2', Cast('Number', '12.34')),
          Store('Boolean1', Cast('Boolean', '1')),
          Store('Boolean2', Cast('Boolean', 0)),
          Store('Token1', Cast(ExpandedTokenClass, testToken)),
          Call(({ context }) => {
            expect(context.fetch('String1')).toBe('1234');
            tested.String1 = true;

            expect(context.fetch('Number1')).toBe(1234);
            tested.Number1 = true;

            expect(context.fetch('Number2')).toBe(12.34);
            tested.Number2 = true;

            expect(context.fetch('Boolean1')).toBe(true);
            tested.Boolean1 = true;

            expect(context.fetch('Boolean2')).toBe(false);
            tested.Boolean2 = true;

            let token = context.fetch('Token1');
            expect(token).toBeInstanceOf(ExpandedTokenClass);
            expect(token).toBeInstanceOf(Token);
            expect(token.name()).toBe('Test');
            expect(token.value()).toBe('Cast');
            expect(Utils.typeOf(token)).toBe('ExpandedTokenClass');
            expect(Utils.isType(token, ExpandedTokenClass)).toBe(true);
            tested.Token1 = true;

            return context.nullResult();
          }),
        ).name('Program'),
      );

      expect(tested.String1).toBe(true);
      expect(tested.Number1).toBe(true);
      expect(tested.Number2).toBe(true);
      expect(tested.Boolean1).toBe(true);
      expect(tested.Boolean2).toBe(true);
      expect(tested.Token1).toBe(true);
    });
  });
});
