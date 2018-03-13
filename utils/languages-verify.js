const fs = require('fs-extra');
const _ = require('lodash');

const L10N_DIR = 'app/l10n';
const L10N_ENGLISH_FILE = `${L10N_DIR}/en_US.json`;
const L10N_LANGUAGE_VALUE_REGEX = /(value:\s'[a-z]{2}_[A-Z]{2}')/g;
const L10N_LANGUAGE_REGEX = /[a-z]{2}_[A-Z]{2}/;
const L10N_LANGUAGE_CONFIGS = 'app/modules/core/l10n/languages.ts';

const PLURAL_KEYWORD_REGEX = /{.*,\s*\bplural\b\s*,/;
const PLURAL_DISALLOWED_KEYWORDS = [
  'zero',
  'one',
  'two',
  'few',
  'many',
];

const VARIABLE_DIFFERENCE_KEY_WHITELIST = [
  'pagingGroup.sayInvalidChar', // TODO 2017-10-16 remove after next language drop
];

// Not ideal to have these in language files.
// Sometimes though a key is calculated dynamically, and some of the keys have values that should not be localized.
// A suggested improvement on this: https://jira-eng-gpk2.cisco.com/jira/browse/ATLAS-3258
const STATIC_ACROSS_LANGUAGES_KEY_LIST = [
  'reportsPage.usageReports.deviceOptions.sparkBoard',
  'trials.sparkBoardSystem',
  'customerPage.sparkBoard',
  'filters.sparkBoard',
  'mediaFusion.metrics.clientType.board',
  'subscriptions.licenseTypes.SB',
  'helpdesk.licenseDisplayNames.SB',
];

// eg. one{, one {, one  {
const PLURAL_DISALLOWED_REGEXPS = _.map(PLURAL_DISALLOWED_KEYWORDS, keyword => new RegExp(keyword + '( ?)+{'));

const PLURAL_OTHER_REGEXP = /other( ?)+{/;

const englishFlatTranslations = getEnglishFlatTranslations();

const languages = fs.readFileSync(L10N_LANGUAGE_CONFIGS, 'utf8').match(L10N_LANGUAGE_VALUE_REGEX).map(language => language.match(L10N_LANGUAGE_REGEX)[0]);

const files = fs.readdirSync(L10N_DIR).map(file => file.replace('.json', ''));

const missingFiles = _.difference(languages, files);
if (missingFiles.length) {
  throw new Error(`Localization files are missing for the following languages: ${missingFiles.join(', ')}`);
}

const missingRefs = _.difference(files, languages);
if (missingRefs.length) {
  throw new Error(`The following localization files are not referenced in code: ${missingRefs.join(', ')}`);
}

let hasError = false;

_.forEach(files, fileName => {
  const languageFile = `${L10N_DIR}/${fileName}.json`;
  const languageJson = fs.readJsonSync(languageFile);
  const flatTranslations = getFlatTranslations(languageJson);

  const disallowedPluralKeywords = getDisallowedPluralKeywordTranslations(flatTranslations);
  if (!_.isEmpty(disallowedPluralKeywords)) {
    hasError = true;
    const disallowedPluralKeywordsString = formatObjectToMultilineString(disallowedPluralKeywords);
    console.error(`[ERROR] ${languageFile} contains plural translations with disallowed keywords (${PLURAL_DISALLOWED_KEYWORDS.join(', ')}):

${disallowedPluralKeywordsString}
    `);
  }

  const missingOtherPluralKeywords = getMissingOtherPluralKeywordTranslations(flatTranslations);
  if (!_.isEmpty(missingOtherPluralKeywords)) {
    hasError = true;
    const missingOtherPluralKeywordsString = formatObjectToMultilineString(missingOtherPluralKeywords);
    console.error(`[ERROR] ${languageFile} contains plural translations with missing other keyword (other):

${missingOtherPluralKeywordsString}
    `);
  }

  const invalidMessageFormatSyntax = getInvalidMessageFormatSyntaxTranslations(flatTranslations);
  if (!_.isEmpty(invalidMessageFormatSyntax)) {
    hasError = true;
    const invalidMessageFormatSyntaxString = formatObjectToMultilineString(invalidMessageFormatSyntax);
    console.error(`[ERROR] ${languageFile} contains invalid MessageFormat (https://github.com/messageformat/messageformat.js#what-does-it-look-like). Requires 'plural' or 'select' keyword in the translation syntax:

${invalidMessageFormatSyntaxString}
    `);
  }

  const variableDifferences = getVariableDifferenceTranslations(flatTranslations, englishFlatTranslations);
  if (!_.isEmpty(variableDifferences)) {
    hasError = true;
    const variableDifferencesWithEnglishString = _.map(variableDifferences, (val, key) => {
      const englishValue = englishFlatTranslations[key];
      return `${key} (${fileName}): ${val}\n${key} (en_US): ${englishValue}`;
    }).join('\n-----\n');
    console.error(`[ERROR] ${languageFile} contains variables that do not match the source in ${L10N_ENGLISH_FILE}:

${variableDifferencesWithEnglishString}
    `);
  }

  const deviatingTranslations = getDeviatingTranslations(flatTranslations, englishFlatTranslations);
  if (!_.isEmpty(deviatingTranslations)) {
    hasError = true;
    const deviatingTranslationsFromEnglishString = _.map(deviatingTranslations, (val, key) => {
      const englishValue = englishFlatTranslations[key];
      return `${key} (${fileName}): ${val}\n${key} (en_US): ${englishValue}`;
    }).join('\n-----\n');
    console.error(`[ERROR] ${languageFile} contains values that do not match the source for static texts in ${L10N_ENGLISH_FILE}:

${deviatingTranslationsFromEnglishString}
    `);
  }

  const imbalancedBrackets = findImbalancedBrackets(flatTranslations);
  if (!_.isEmpty(imbalancedBrackets)) {
    hasError = true;
    const imbalancedBracketsFormatSyntaxString = formatObjectToMultilineString(imbalancedBrackets);
    console.error(`[ERROR] ${languageFile} contains unmatched brackets:

${imbalancedBracketsFormatSyntaxString}`);
  }
});

if (hasError) {
  throw new Error('Failed to validate all json files. Please see error output for detail.');
}

function filterDisallowedPluralKeywords(value) {
  return PLURAL_KEYWORD_REGEX.test(value) && _.some(PLURAL_DISALLOWED_REGEXPS, keywordRegExp => keywordRegExp.test(value));
}

function getDisallowedPluralKeywordTranslations(translationObj) {
  return _.pickBy(translationObj, filterDisallowedPluralKeywords);
}

function filterMissingOtherPluralKeyword(value) {
  return PLURAL_KEYWORD_REGEX.test(value) && !PLURAL_OTHER_REGEXP.test(value);
}

function getMissingOtherPluralKeywordTranslations(translationObj) {
  return _.pickBy(translationObj, filterMissingOtherPluralKeyword);
}

function filterInvalidMessageFormatSyntax(value) {
  return /\{\s*[a-z]+\s*,(?!\s*(plural|select|selectordinal)\s*,).*\}\s*\}/.test(value);
}

function getInvalidMessageFormatSyntaxTranslations(translationObj) {
  return _.pickBy(translationObj, filterInvalidMessageFormatSyntax);
}

function getVariableNames(value) {
  const variableRegex = /{{([^{}]*)}}/g;
  const matchedVariables = [];
  let match = variableRegex.exec(value);
  while (match !== null) {
    matchedVariables.push(_.trim(match[1]));
    match = variableRegex.exec(value);
  }
  return matchedVariables;
}

function getEnglishFlatTranslations() {
  const languageJson = fs.readJsonSync(L10N_ENGLISH_FILE);
  return getFlatTranslations(languageJson);
}

function getFlatTranslations(languageJson) {
  const result = {};
  buildFlatTranslations(result, '', languageJson);
  return result;
}

function buildFlatTranslations(result, prefix, valueObj) {
  _.forEach(valueObj, (value, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (_.isString(value)) {
      result[newKey] = value;
    } else {
      buildFlatTranslations(result, newKey, value);
    }
  });
}

function getVariableDifferenceTranslations(checkObj, origObj) {
  return _.pickBy(checkObj, (value, key) => {
    if (_.includes(VARIABLE_DIFFERENCE_KEY_WHITELIST, key)) {
      return false;
    }
    const origValue = origObj[key];
    if (!origValue) {
      return false;
    }
    const checkVariableNames = getVariableNames(value);
    if (!checkVariableNames.length) {
      return false;
    }
    const origVariableNames = getVariableNames(origValue);
    const diffVariableNames = _.difference(checkVariableNames, origVariableNames);
    if (diffVariableNames.length) {
      return true;
    }
  });
}

function getDeviatingTranslations(checkObj, origObj) {
  return _.pickBy(checkObj, (value, key) => {
    if (!_.includes(STATIC_ACROSS_LANGUAGES_KEY_LIST, key)) {
      return false;
    }
    const origValue = origObj[key];
    if (!origValue) {
      return false;
    }
    return value !== origValue;
  });
}

function formatObjectToMultilineString(obj) {
  return _.map(obj, (value, key) => `${key}: ${value}`).join('\n');
}

function findImbalancedBrackets(translations) {
  let imbalancedBrackets = {
  };

  _.forEach(translations, function (value, key) {
    let str = value;

    if (PLURAL_KEYWORD_REGEX.test(value)) {
      let opens = str.match(/\{/g) || [];
      let closes = str.match(/\}/g) || [];

      if (opens.length !== closes.length) {
        imbalancedBrackets[key] = value;
      }
    }
  });

  return imbalancedBrackets;
}
