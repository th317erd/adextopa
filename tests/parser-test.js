import { Token, Tokenizer, createTokenParser, AND, OR, REPEAT, REGEXP } from '../src';

// Create an ansychronous parser
var TEST_PARSER = createTokenParser(function() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(REGEXP(/\w+/).call(this));
    }, 150);
  });
});

var tokenizer = new Tokenizer(
  REPEAT( // Continue to repeat until parser (OR) is false
    OR( // one of these must be successful
      REGEXP(/\w+/),
      REGEXP(/\s+/),
      TEST_PARSER
    )
  )
);

tokenizer.parse('This is a test string that is being parsed', function(err, result) {
  if (err) {
    console.error(err);
    return;
  }

  console.log('Result: ', result);
});
