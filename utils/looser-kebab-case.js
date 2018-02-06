/* eslint-env es6 */

'use strict';

const _ = require('lodash');
const exceptionSubstrings = ['l10n'];

function looserKebabCase(str) {
  // e.g. 'l-10-n-title'
  const initialPassKebabCase = _.kebabCase(str);
  let result = initialPassKebabCase;

  _.forEach(exceptionSubstrings, (exceptionSubstring) => {
    // e.g. /l10n/gi
    const re = new RegExp(exceptionSubstring, 'gi');

    // early-out if regex not found
    if (!re.test(str)) {
      return;
    }

    // e.g. 'l-10-n'
    const substrToBeReplaced = _.kebabCase(exceptionSubstring);

    // e.g. /l-10-n/g
    const substrToBeReplacedAsRegEx = new RegExp(substrToBeReplaced, 'g');

    // e.g. 'l-10-n-title'.replace(/l-10-n/g, 'l10n');
    result = result.replace(substrToBeReplacedAsRegEx, exceptionSubstring);
  });

  return result;
}

module.exports = looserKebabCase;
