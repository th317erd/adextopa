/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../support/test-helpers.js';

import {
  Parser,
  Matchers,
} from '../../../lib/index.js';

const {
  Equals,
  Fetch,
  If,
  IfAny,
  Matches,
  Panic,
  Program,
  Store,
} = Matchers;

describe('/Core/Matchers/IfNot', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser({ source: 'Test 1234' });
  });

  it('works', async () => {
    try {
      let result = await parser.exec(
        Program(
          Matches(/test/i).name('Name'),
          Equals(' ').name('Space'),
          If(Matches(/\d+/).name('Number')).Then(
            Panic('Oh no! Expected something other than a number!'),
          ),
        ).name('TestProgram'),
      );

      _TestHelpers.inspectLog(result);

      fail('unreachable!');
    } catch (error) {
      expect(error.message).toEqual('Oh no! Expected something other than a number!');
    }
  });

  it('works when inverted', async () => {
    try {
      await parser.exec(
        Program(
          Matches(/test/i).name('Name'),
          Equals(' ').name('Space'),
          If(Matches(/\D+/).name('Number')).Then(
            Panic('Oh no! Expected a number!'),
          ).Invert(true),
        ).name('TestProgram'),
      );

      fail('unreachable!');
    } catch (error) {
      expect(error.message).toEqual('Oh no! Expected a number!');
    }
  });

  it('properly is ignored on success', async () => {
    try {
      let result = await parser.exec(
        Program(
          Matches(/test/i).name('Name'),
          Equals(' ').name('Space'),
          If(Matches(/\D+/).name('NotANumber')).Then(
            Panic('Oh no! Expected a number!'),
          ),
          Matches(/\d+/).name('CapturedNumber'),
        ).name('TestProgram'),
      );

      expect(result).toMatchSnapshot();
    } catch (error) {
      fail('unreachable!');
    }
  });

  it('works for other truthy values', async () => {
    try {
      await parser.exec(
        Program(
          Matches(/test/i).name('Name'),
          Store('CapturedValue', Equals(' ').name('Space')),
          If(Fetch('CapturedValue.matchedOffset')).Then(
            Panic('Oh no! MatchedOffset is larger than zero!'),
          ),
          Matches(/\d+/).name('CapturedNumber'),
        ).name('TestProgram'),
      );

      fail('unreachable!');
    } catch (error) {
      expect(error.message).toBe('Oh no! MatchedOffset is larger than zero!');
    }
  });

  it('works with an else action', async () => {
    try {
      let result = await parser.exec(
        Program(
          Matches(/test/i).name('Name'),
          If(Matches(/\d+/).name('Number')).Then(
            Panic('Oh no! Expected whitespace!'),
          ).Else(
            Equals(' ').name('Space'),
          ),
          Matches(/\d+/).name('CapturedNumber'),
        ).name('TestProgram'),
      );

      expect(result).toMatchSnapshot();
    } catch (error) {
      fail('unreachable!');
    }
  });

  it('works with multiple conditions (all)', async () => {
    try {
      await parser.exec(
        Program(
          If(
            Matches(/test/i).name('Name'),
            Equals(' ').name('Space'),
            Matches(/\d+/).name('Number'),
          ).Then(
            Panic('Oh no! I matched everything!'),
          ),
        ).name('TestProgram'),
      );

      fail('unreachable');
    } catch (error) {
      expect(error.message).toBe('Oh no! I matched everything!');
    }
  });

  it('works with multiple conditions (any)', async () => {
    try {
      await parser.exec(
        Program(
          IfAny(
            Equals(' ').name('Space'),
            Matches(/\d+/).name('Number'),
            Matches(/test/i).name('Name'),
          ).Then(
            Panic('Oh no! I matched everything!'),
          ),
        ).name('TestProgram'),
      );

      fail('unreachable');
    } catch (error) {
      expect(error.message).toBe('Oh no! I matched everything!');
    }
  });

  it('works with a callback for Then', async () => {
    try {
      let result = await parser.exec(
        Program(
          IfAny(
            Equals(' ').name('Space'),
            Matches(/\d+/).name('Number'),
            Matches(/test/i).name('Name'),
          ).Then((_, result) => {
            return result;
          }),
        ).name('TestProgram'),
      );

      expect(result).toMatchSnapshot();
    } catch (error) {
      expect(error.message).toBe('Oh no! I matched everything!');
    }
  });

  it('works with a callback for Else', async () => {
    try {
      let result = await parser.exec(
        Program(
          IfAny(
            Equals(' '),
            Equals('Derp'),
            Equals('Dang!'),
          ).Then(Panic('Not supposed to be here!')).Else(({ context }, result) => {
            return context.tokenResult({ name: 'Else', value: 'Else Branch!' });
          }),
        ).name('TestProgram'),
      );

      expect(result).toMatchSnapshot();
    } catch (error) {
      expect(error.message).toBe('Oh no! I matched everything!');
    }
  });
});
