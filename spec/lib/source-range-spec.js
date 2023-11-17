/* eslint-disable no-array-constructor */
/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../support/test-helpers.js';

import {
  Utils,
  SourceRange,
} from '../../lib/index.js';

describe('SourceRange', () => {
  describe('new', () => {
    it('works', () => {
      expect((new SourceRange()).toJSON()).toEqual({ $type: 'SourceRange', start: 0, end: 0, relative: false });
      expect((new SourceRange(null, 10)).toJSON()).toEqual({ $type: 'SourceRange', start: 0, end: 10, relative: false });
      expect((new SourceRange(null, null)).toJSON()).toEqual({ $type: 'SourceRange', start: 0, end: 0, relative: false });
      expect((new SourceRange('12', null)).toJSON()).toEqual({ $type: 'SourceRange', start: 0, end: 12, relative: false });
      expect((new SourceRange('12', 5)).toJSON()).toEqual({ $type: 'SourceRange', start: 5, end: 12, relative: false });
      expect((new SourceRange('12', '5')).toJSON()).toEqual({ $type: 'SourceRange', start: 5, end: 12, relative: false });
      expect((new SourceRange('12', '5.45')).toJSON()).toEqual({ $type: 'SourceRange', start: 5, end: 12, relative: false });
      expect((new SourceRange({ start: 1, end: 3 })).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 3, relative: false });
      expect((new SourceRange({ start: 3, end: 1 })).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 3, relative: false });
      expect((new SourceRange({ start: '3', end: '1' })).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 3, relative: false });
      expect((new SourceRange({ start: '3', end: '1' })).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 3, relative: false });
      expect((new SourceRange({ start: 1, end: 3, relative: true })).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 3, relative: true });
      expect((new SourceRange({ start: 1, end: 3, isRelative: true })).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 3, relative: true });
      expect((new SourceRange(1, 3, true)).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 3, relative: true });
      expect((new SourceRange(new SourceRange(1, 3, true))).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 3, relative: true });
      expect((new SourceRange(new SourceRange(6, 2, false))).toJSON()).toEqual({ $type: 'SourceRange', start: 2, end: 6, relative: false });

      // Won't swap start/end order in relative mode
      expect((new SourceRange(5, 2, true)).toJSON()).toEqual({ $type: 'SourceRange', start: 5, end: 2, relative: true });
      expect((new SourceRange(-2, -5)).toJSON()).toEqual({ $type: 'SourceRange', start: -2, end: -5, relative: true });
    });
  });

  describe('isRelative', () => {
    it('works', () => {
      expect((new SourceRange()).isRelative()).toBe(false);
      expect((new SourceRange(1, 5)).isRelative()).toBe(false);

      expect((new SourceRange(-1)).isRelative()).toBe(true);
      expect((new SourceRange('-1')).isRelative()).toBe(true);
      expect((new SourceRange(-1, -5)).isRelative()).toBe(true);
      expect((new SourceRange(-1, -5, false)).isRelative()).toBe(true);
      expect((new SourceRange(1, 5, true)).isRelative()).toBe(true);
    });
  });

  describe('setStart', () => {
    it('works', () => {
      let sourceRange = new SourceRange(1, 5);
      expect(sourceRange.start).toBe(1);
      expect(sourceRange.setStart(2)).toBe(sourceRange);
      expect(sourceRange.start).toBe(2);
      expect(sourceRange.setStart(-2)).toBe(sourceRange);
      expect(sourceRange.start).toBe(-2);
    });
  });

  describe('addToStart', () => {
    it('works', () => {
      let sourceRange = new SourceRange(1, 5);
      expect(sourceRange.start).toBe(1);
      expect(sourceRange.addToStart(2)).toBe(sourceRange);
      expect(sourceRange.start).toBe(3);
      expect(sourceRange.addToStart(-3)).toBe(sourceRange);
      expect(sourceRange.start).toBe(0);
    });
  });

  describe('setEnd', () => {
    it('works', () => {
      let sourceRange = new SourceRange(1, 5);
      expect(sourceRange.end).toBe(5);
      expect(sourceRange.setEnd(2)).toBe(sourceRange);
      expect(sourceRange.end).toBe(2);
      expect(sourceRange.setEnd(-2)).toBe(sourceRange);
      expect(sourceRange.end).toBe(-2);
    });
  });

  describe('addToEnd', () => {
    it('works', () => {
      let sourceRange = new SourceRange(1, 5);
      expect(sourceRange.end).toBe(5);
      expect(sourceRange.addToEnd(2)).toBe(sourceRange);
      expect(sourceRange.end).toBe(7);
      expect(sourceRange.addToEnd(-3)).toBe(sourceRange);
      expect(sourceRange.end).toBe(4);
    });
  });

  describe('setTo', () => {
    it('works', () => {
      let sourceRange = new SourceRange(1, 5);
      expect(sourceRange.start).toBe(1);
      expect(sourceRange.end).toBe(5);
      expect(sourceRange.setTo(2, 6)).toBe(sourceRange);
      expect(sourceRange.start).toBe(2);
      expect(sourceRange.end).toBe(6);

      expect(sourceRange.setTo('3', '7')).toBe(sourceRange);
      expect(sourceRange.start).toBe(3);
      expect(sourceRange.end).toBe(7);

      expect(sourceRange.setTo(new SourceRange(8, 10))).toBe(sourceRange);
      expect(sourceRange.start).toBe(8);
      expect(sourceRange.end).toBe(10);
    });
  });

  describe('addTo', () => {
    it('works', () => {
      let sourceRange = new SourceRange(1, 5);
      expect(sourceRange.start).toBe(1);
      expect(sourceRange.end).toBe(5);
      expect(sourceRange.addTo(2, 6)).toBe(sourceRange);
      expect(sourceRange.start).toBe(3);
      expect(sourceRange.end).toBe(11);

      expect(sourceRange.addTo('-3', '-7')).toBe(sourceRange);
      expect(sourceRange.start).toBe(0);
      expect(sourceRange.end).toBe(4);

      expect(sourceRange.addTo(new SourceRange(8, 10))).toBe(sourceRange);
      expect(sourceRange.start).toBe(8);
      expect(sourceRange.end).toBe(14);
    });
  });

  describe('clampTo', () => {
    it('works', () => {
      expect((new SourceRange(10, 20)).clampTo().toJSON()).toEqual({ $type: 'SourceRange', start: 10, end: 20, relative: false });
      expect((new SourceRange(10, 20)).clampTo(new SourceRange(2, 21)).toJSON()).toEqual({ $type: 'SourceRange', start: 10, end: 20, relative: false });
      expect((new SourceRange(10, 20)).clampTo(new SourceRange(2, 21), new SourceRange(11, 20)).toJSON()).toEqual({ $type: 'SourceRange', start: 11, end: 20, relative: false });
      expect((new SourceRange(10, 20)).clampTo(new SourceRange(2, 21), new SourceRange(15, 15)).toJSON()).toEqual({ $type: 'SourceRange', start: 15, end: 15, relative: false });
    });
  });

  describe('expandTo', () => {
    it('works', () => {
      expect((new SourceRange(10, 20)).expandTo().toJSON()).toEqual({ $type: 'SourceRange', start: 10, end: 20, relative: false });
      expect((new SourceRange(10, 20)).expandTo(new SourceRange(2, 21)).toJSON()).toEqual({ $type: 'SourceRange', start: 2, end: 21, relative: false });
      expect((new SourceRange(10, 20)).expandTo(new SourceRange(9, 21), new SourceRange(1, 30)).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 30, relative: false });
      expect((new SourceRange(10, 20)).expandTo(new SourceRange(1, 99), new SourceRange(15, 15)).toJSON()).toEqual({ $type: 'SourceRange', start: 1, end: 99, relative: false });
    });
  });

  describe('clone', () => {
    it('works', () => {
      let sourceRange1 = new SourceRange(10, 20);
      let sourceRange2 = sourceRange1.clone();

      expect(sourceRange2.toJSON()).toEqual(sourceRange1.toJSON());
      expect(sourceRange2).not.toBe(sourceRange1);

      sourceRange2 = sourceRange1.clone(11);
      expect(sourceRange2.toJSON()).toEqual({ $type: 'SourceRange', start: 11, end: 20, relative: false });
      expect(sourceRange2).not.toBe(sourceRange1);

      sourceRange2 = sourceRange1.clone(12, 16);
      expect(sourceRange2.toJSON()).toEqual({ $type: 'SourceRange', start: 12, end: 16, relative: false });
      expect(sourceRange2).not.toBe(sourceRange1);

      sourceRange2 = sourceRange1.clone(12, 16, true);
      expect(sourceRange2.toJSON()).toEqual({ $type: 'SourceRange', start: 12, end: 16, relative: true });
      expect(sourceRange2).not.toBe(sourceRange1);

      sourceRange2 = sourceRange1.clone({ start: 12, end: 16, relative: true });
      expect(sourceRange2.toJSON()).toEqual({ $type: 'SourceRange', start: 12, end: 16, relative: true });
      expect(sourceRange2).not.toBe(sourceRange1);
    });
  });

  describe('get', () => {
    it('works', () => {
      let sourceRange = new SourceRange(6, 20);
      expect(sourceRange.get('start')).toBe(6);
      expect(sourceRange.get('end')).toBe(20);
      expect(sourceRange.get('size')).toBe(14);
      expect(sourceRange.get('anything')).toBe(undefined);
      expect(sourceRange.get('anything', 'other')).toBe('other');
    });
  });

  describe('fetch', () => {
    it('works', () => {
      let sourceRange = new SourceRange(6, 20);
      expect(sourceRange.fetch('start')).toBe(6);
      expect(sourceRange.fetch('end')).toBe(20);
      expect(sourceRange.fetch('size')).toBe(14);
      expect(sourceRange.fetch('anything')).toBe(undefined);
      expect(sourceRange.fetch('anything', 'other')).toBe('other');
    });
  });

  describe('custom inspect', () => {
    it('works', () => {
      let sourceRange = new SourceRange(6, 20);
      expect(_TestHelpers.inspect.call({ colors: false }, sourceRange)).toMatchSnapshot();
    });
  });

  describe('toString', () => {
    it('works', () => {
      let sourceRange = new SourceRange(6, 20);
      expect(('' + sourceRange)).toMatchSnapshot();
    });
  });

  describe('toJSON', () => {
    it('works', () => {
      let sourceRange = new SourceRange(6, 20);
      expect(sourceRange.toJSON()).toMatchSnapshot();
    });
  });
});
