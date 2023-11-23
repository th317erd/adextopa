/* eslint-disable no-array-constructor */
/* eslint-disable no-magic-numbers */

import {
  Scope,
} from '../../lib/index.js';

describe('Scope', () => {
  describe('new', () => {
    it('works', () => {
      let FAKE_PARENT = {};
      let scope = new Scope({ parent: FAKE_PARENT });

      expect(scope.parent).toBe(FAKE_PARENT);

      scope = new Scope({ parent: FAKE_PARENT, properties: { test: true, hello: 'world' } });
      expect(scope.parent).toBe(FAKE_PARENT);
      expect(scope.toJSON()).toEqual({
        $type:      'Scope',
        properties: {
          test:   true,
          hello:  'world',
        },
      });
    });
  });

  describe('toJSON', () => {
    it('works', () => {
      let scope1 = new Scope({
        properties: {
          func:   () => {}, // won't serialize
          hello:  'world',
          see:    1,
          test:   true,
        },
      });

      let scope2 = new Scope({
        parent:     scope1,
        properties: {
          hello:  'dude!',
          see:    10,
          test:   false,
          there:  'it is',
        },
      });

      expect(scope2.toJSON()).toEqual({
        $type:      'Scope',
        properties: {
          hello:  'dude!',
          see:    10,
          test:   false,
          there:  'it is',
        },
      });
    });
  });

  describe('fetch', () => {
    it('works', () => {
      let FAKE_PARENT = {};

      let scope = new Scope({ parent: FAKE_PARENT });
      expect(scope.get('test')).toBe(undefined);
      expect(scope.set('test', 123)).toBe(scope);
      expect(scope.get('test')).toBe(123);
      expect(scope.get('parent')).toBe(FAKE_PARENT); // dynamic property
    });

    it('works when stacked', () => {
      let scope1 = new Scope();
      let scope2 = new Scope({ parent: scope1 });

      expect(scope1.get('test')).toBe(undefined);
      expect(scope2.get('test')).toBe(undefined);

      expect(scope1.set('test', 'derp')).toBe(scope1);
      expect(scope2.get('test')).toBe('derp');

      expect(scope2.set('test', 'other')).toBe(scope2);
      expect(scope1.get('test')).toBe('derp');
    });
  });
});
