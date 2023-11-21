import * as Utils     from '../utils.js';
import { Matcher }    from '../matcher.js';
import { MapResult }  from './map-result.js';

export const TrimValue = Matcher.createMatcherMethod((matcher) => {
  return MapResult(
    matcher,
    (_, result) => {
      if (result.token) {
        let value = result.token.value();
        if (Utils.isType(value, 'String'))
          result.token.value(value.trim());
      } else if (Utils.isType(result.value, 'String')) {
        result.setValue(result.value.trim());
      }
    },
  ).name('TrimValue');
});
