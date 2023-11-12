/* eslint-disable no-magic-numbers */

import { snapshot } from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      NumberLiteral,
    },
  },
} = Script;

const FAIL = 'ec849c2b4452f1c7538f193a18f1d244';

describe('/Script/V1/NumberLiteral', () => {
  it('works', async () => {
    const test = async (source, debug) => {
      let parser = new Parser({ source });
      return snapshot(await parser.tokenize(NumberLiteral(), debug), debug);
    };

    expect(await test('0.0')).toBe('3fb1640ffa4328f588c51b9a10727404');
    expect(await test('10.02')).toBe('6456afefd7d475ed2bb034e075f9aa5f');
    expect(await test('-0.0')).toBe('15dfed5c5ebf5ff2e006dd25693c55e1');
    expect(await test('-0.0+')).toBe('15dfed5c5ebf5ff2e006dd25693c55e1');
    expect(await test('-00.0001')).toBe('e357c24f8ec8dcf1112417587ac813da');
    expect(await test('+0.0')).toBe('ab41a9f2b5669af1e1439e181a1f65c0');
    expect(await test('+0.0-')).toBe('ab41a9f2b5669af1e1439e181a1f65c0');
    expect(await test('+42')).toBe('ab6be861f75a54650bac443185be2f06');
    expect(await test('-42')).toBe('12df0dc6c513dabb442eb62c1ed53389');
    expect(await test('-0')).toBe('cdcf5fb2fb896217051b1777c447f413');
    expect(await test('0')).toBe('7b8be916fe4137fa80f9daf0d6bb815d');
    expect(await test('105')).toBe('7614530e92e81b8fc92d5fc8d8123102');
    expect(await test('8.102916686331973e-11')).toBe('b8f7891dce603546ea21c5ed139fb83a');
    expect(await test('8.102916686331973e-1')).toBe('8a6a4605599303d82c62d6a7c755943d');
    expect(await test('8.0e-001')).toBe('11c39731f55d1e8ef68417755dd8b2b2');
    expect(await test('0.+0')).toBe(FAIL);
    expect(await test('0.-0')).toBe(FAIL);
    expect(await test('.0')).toBe(FAIL);
    expect(await test('0.')).toBe(FAIL);
    expect(await test('0.0e')).toBe(FAIL);
    expect(await test('0.0e-')).toBe(FAIL);
  });
});
