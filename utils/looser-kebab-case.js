var _ = require('lodash');
var exceptionSubstrings = ['l10n'];

function looserKebabCase(str) {
  // e.g. 'l-10-n-title'
  var initialPassKebabCase = _.kebabCase(str);
  var result = initialPassKebabCase;

  _.forEach(exceptionSubstrings, function (exceptionSubstring) {
    // e.g. /l10n/gi
    var re = new RegExp(exceptionSubstring, 'gi');

    // early-out if regex not found
    if (!re.test(str)) {
      return;
    }

    // e.g. 'l-10-n'
    var substrToBeReplaced = _.kebabCase(exceptionSubstring);

    // e.g. /l-10-n/g
    var substrToBeReplacedAsRegEx = new RegExp(substrToBeReplaced, 'g');

    // e.g. 'l-10-n-title'.replace(/l-10-n/g, 'l10n');
    result = result.replace(substrToBeReplacedAsRegEx, exceptionSubstring);
  });

  return result;
}

module.exports = looserKebabCase;
