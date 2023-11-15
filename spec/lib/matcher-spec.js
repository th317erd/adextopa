/* eslint-disable no-magic-numbers */

import {
  Matcher,
} from '../../lib/index.js';

describe('Matcher', () => {
  describe('new', () => {
    it('works', () => {
      let matcher = new Matcher();
      expect(matcher.name).toBe('Matcher');
      expect(matcher.hasCustomName).toBe(false);

      matcher = new Matcher({ name: 'Test' });
      expect(matcher.name).toBe('Test');
      expect(matcher.hasCustomName).toBe(true);
    });
  });

  describe('clone', () => {
    it('works', () => {
      let matcher = new Matcher();
      expect(matcher.name).toBe('Matcher');
      expect(matcher.hasCustomName).toBe(false);

      let matcher2 = matcher.clone();
      expect(matcher2).not.toBe(matcher);
      expect(matcher2.name).toBe('Matcher');
      expect(matcher2.hasCustomName).toBe(false);

      let matcher3 = matcher.clone({ name: 'Test' });
      expect(matcher3).not.toBe(matcher);
      expect(matcher3.name).toBe('Test');
      expect(matcher3.hasCustomName).toBe(true);
    });
  });
});
