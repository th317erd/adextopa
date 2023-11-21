/* eslint-disable no-magic-numbers */

import * as _TestHelpers from '../../../support/test-helpers.js';

import {
  Parser,
  Script,
} from '../../../../lib/index.js';

const {
  V1: {
    Matchers: {
      RegExpLiteral,
    },
  },
} = Script;

describe('/Script/V1/RegExpLiteral', () => {
  it('works', async () => {
    const test = async (source, debug) => {
      let parser = new Parser({ source });

      try {
        return await parser.exec(RegExpLiteral(), { debug });
      } catch (error) {
        return error;
      }
    };

    expect(await test('/cat+/')).toMatchSnapshot();
    expect(await test('/cat*/')).toMatchSnapshot();
    expect(await test('/cat[abc]/')).toMatchSnapshot();
    expect(await test('/cat[abcA-Z]/')).toMatchSnapshot();
    expect(await test('/[a-zA-Z-]/')).toMatchSnapshot();
    expect(await test('/[^a-z]/')).toMatchSnapshot();
    expect(await test('/[^\\[-\\]\\]-]/')).toMatchSnapshot();
    expect(await test('/^dog/')).toMatchSnapshot();
    expect(await test('/^bark$/')).toMatchSnapshot();
    expect(await test('/\\..*./')).toMatchSnapshot();
    expect(await test('/\\..*./')).toMatchSnapshot();
    expect(await test('/\\s/')).toMatchSnapshot();
    expect(await test('/\\s\\w\\d\\b\\S\\W\\D\\B/')).toMatchSnapshot();
    expect(await test('/[\\s\\w\\d\\b\\S\\W\\D\\B/]/')).toMatchSnapshot();
    expect(await test('/cat/dgimsuy')).toMatchSnapshot();
    expect(await test('/cat/dgimsvy')).toMatchSnapshot();

    expect(await test('/+cat+/')).toMatchSnapshot(); // Failure
    expect(await test('/cat+*/')).toMatchSnapshot(); // Failure
    expect(await test('/cat/x')).toMatchSnapshot(); // Failure
    expect(await test('/cat/uv')).toMatchSnapshot(); // Failure
    expect(await test('/cat/dd')).toMatchSnapshot(); // Failure
  });
});
