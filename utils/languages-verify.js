var fs = require('fs-extra');
var _ = require('lodash');

var L10N_DIR = 'app/l10n';
var L10N_SOURCE_VALUE_REGEX = /(value:\s'[a-z]{2}_[A-Z]{2}')/g;
var L10N_SOURCE_REGEX = /[a-z]{2}_[A-Z]{2}/;
var L10N_SOURCE = 'app/modules/core/l10n/languages.js';

var PLURAL_DISALLOWED_KEYWORDS = [
  'zero',
  'one',
  'two',
  'few',
  'many',
];

var PLURAL_DISALLOWED_REGEXPS = _.map(PLURAL_DISALLOWED_KEYWORDS, function (keyword) {
  return new RegExp(keyword + '( ?)+{'); // eg. one{, one {, one  {
});

var PLURAL_OTHER_REGEXP = /other( ?)+{/;

var languages = fs.readFileSync(L10N_SOURCE, 'utf8').match(L10N_SOURCE_VALUE_REGEX).map(function (language) {
  return language.match(L10N_SOURCE_REGEX)[0];
});

var files = fs.readdirSync(L10N_DIR).map(function (file) {
  return file.replace('.json', '');
});

var missingFiles = _.difference(languages, files);
if (missingFiles.length) {
  throw new Error(`Localization files are missing for the following languages: ${missingFiles.join(', ')}`);
}

var missingRefs = _.difference(files, languages);
if (missingRefs.length) {
  throw new Error(`The following localization files are not referenced in code: ${missingRefs.join(', ')}`);
}

// validate plural keywords in translations
_.forEach(files, function (fileName) {
  var languageFile = L10N_DIR + '/' + fileName + '.json';
  var languageJson = fs.readJsonSync(languageFile);
  var translationValues = flatten(languageJson);

  var disallowedPluralKeywords = _.filter(translationValues, filterDisallowedPluralKeywords);
  if (disallowedPluralKeywords.length) {
    throw new Error(`${languageFile} contains plural translations with disallowed keywords (${PLURAL_DISALLOWED_KEYWORDS.join(', ')}):\r\n ${disallowedPluralKeywords.join('\r\n')}`);
  }

  var missingOtherPluralKeywords = _.filter(translationValues, filterMissingOtherPluralKeyword);
  if (missingOtherPluralKeywords.length) {
    throw new Error(`${languageFile} contains plural translations with missing other keyword (other):\r\n ${missingOtherPluralKeywords.join('\r\n')}`);
  }
});

function flatten(objectOrArray) {
  // If some of the elements or values are still objects, recursively do it again
  if (_.some(objectOrArray, _.isObject)) {
    return flatten(_.flatMap(objectOrArray, function (value) {
      return _.isString(value) ? value : _.values(value);
    }));
  } else {
    return objectOrArray;
  }
}

function filterDisallowedPluralKeywords(value) {
  return _.includes(value, 'plural,') && _.some(PLURAL_DISALLOWED_REGEXPS, function (keywordRegExp) {
    return keywordRegExp.test(value);
  });
}

function filterMissingOtherPluralKeyword(value) {
  return _.includes(value, 'plural,') && !PLURAL_OTHER_REGEXP.test(value);
}
