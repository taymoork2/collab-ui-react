const fs = require('fs-extra');
const _ = require('lodash');

const L10N_DIR = 'app/l10n';
const L10N_SOURCE_VALUE_REGEX = /(value:\s'[a-z]{2}_[A-Z]{2}')/g;
const L10N_SOURCE_REGEX = /[a-z]{2}_[A-Z]{2}/;
const L10N_SOURCE = 'app/modules/core/l10n/languages.ts';

const PLURAL_DISALLOWED_KEYWORDS = [
  'zero',
  'one',
  'two',
  'few',
  'many',
];

// eg. one{, one {, one  {
const PLURAL_DISALLOWED_REGEXPS = _.map(PLURAL_DISALLOWED_KEYWORDS, keyword => new RegExp(keyword + '( ?)+{'));

const PLURAL_OTHER_REGEXP = /other( ?)+{/;

const englishVariableNames = getEnglishVariableNames();

const languages = fs.readFileSync(L10N_SOURCE, 'utf8').match(L10N_SOURCE_VALUE_REGEX).map(language => language.match(L10N_SOURCE_REGEX)[0]);

const files = fs.readdirSync(L10N_DIR).map(file => file.replace('.json', ''));

const missingFiles = _.difference(languages, files);
if (missingFiles.length) {
  throw new Error(`Localization files are missing for the following languages: ${missingFiles.join(', ')}`);
}

const missingRefs = _.difference(files, languages);
if (missingRefs.length) {
  throw new Error(`The following localization files are not referenced in code: ${missingRefs.join(', ')}`);
}

// validate plural keywords in translations
_.forEach(files, fileName => {
  const languageFile = `${L10N_DIR}/${fileName}.json`;
  const languageJson = fs.readJsonSync(languageFile);
  const translationValues = flatten(languageJson);

  const disallowedPluralKeywords = _.filter(translationValues, filterDisallowedPluralKeywords);
  if (disallowedPluralKeywords.length) {
    throw new Error(`${languageFile} contains plural translations with disallowed keywords (${PLURAL_DISALLOWED_KEYWORDS.join(', ')}):\r\n ${disallowedPluralKeywords.join('\r\n')}`);
  }

  const missingOtherPluralKeywords = _.filter(translationValues, filterMissingOtherPluralKeyword);
  if (missingOtherPluralKeywords.length) {
    throw new Error(`${languageFile} contains plural translations with missing other keyword (other):\r\n ${missingOtherPluralKeywords.join('\r\n')}`);
  }

  const invalidMessageFormatSyntax = _.filter(translationValues, filterMessageFormatSyntax);
  if (invalidMessageFormatSyntax.length) {
    throw new Error(`${languageFile} contains invalid MessageFormat.

https://github.com/messageformat/messageformat.js#what-does-it-look-like
Requires 'plural' or 'select' keyword in the translation syntax:

${invalidMessageFormatSyntax.join('\r\n')}`);
  }

  const variableNames = getVariableNames(translationValues);
  const invalidVariableNames = _.difference(variableNames, englishVariableNames);
  if (invalidVariableNames.length) {
    throw new Error(`${languageFile} contains invalid variable names (eg. {{ <variableName> }}).

Invalid Variable Names: ${invalidVariableNames.join(', ')}
`);
  }
});

function flatten(objectOrArray) {
  // If some of the elements or values are still objects, recursively do it again
  if (_.some(objectOrArray, _.isObject)) {
    return flatten(_.flatMap(objectOrArray, value => {
      return _.isString(value) ? value : _.values(value);
    }));
  } else {
    return objectOrArray;
  }
}

function filterDisallowedPluralKeywords(value) {
  return _.includes(value, 'plural,') && _.some(PLURAL_DISALLOWED_REGEXPS, keywordRegExp => keywordRegExp.test(value));
}

function filterMissingOtherPluralKeyword(value) {
  return _.includes(value, 'plural,') && !PLURAL_OTHER_REGEXP.test(value);
}

function filterMessageFormatSyntax(value) {
  return /\{\s*[a-z]+\s*,(?!\s*(plural|select|selectordinal)\s*,).*\}\s*\}/.test(value);
}

function getVariableNames(values) {
  var valueVariables = _.map(values, value => {
    const variableRegex = /{{([^{}]*)?}}/g;
    const matchedVariables = [];
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = variableRegex.exec(value)) !== null) {
      matchedVariables.push(_.trim(match[1]));
    }
    return matchedVariables;
  });
  const allVariables = _.flatMap(valueVariables);
  const uniqVariables = _.uniq(allVariables);
  return uniqVariables;
}

function getEnglishVariableNames() {
  const languageFile = `${L10N_DIR}/en_US.json`;
  const languageJson = fs.readJsonSync(languageFile);
  const translationValues = flatten(languageJson);
  return getVariableNames(translationValues);
}
