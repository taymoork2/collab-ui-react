import { LanguagesProvider } from '../../../core/l10n/languages.provider';
import { languageConfigs } from '../../../core/l10n/languages';
import * as _ from 'lodash';

const validations = getJSONFixture('sunlight/json/configStringValidations.json');
const TRANSLATION_NOT_FOUND = 'TRANSLATION_NOT_FOUND';
angular.module('SunlightLanguageValidation', [
  require('angular-ui-router'),
  require('angular-translate')])
    .provider('languages', LanguagesProvider)
    .controller('LanguageController', function ($scope, $translate) {
      $scope.switchLanguage = function (locale) {
        $translate.use(locale);
      };
    });

describe('Langauage Translations for Config Template Strings', () => {
  beforeEach(angular.mock.module('SunlightLanguageValidation'));

  let scope, translate;

  beforeEach(angular.mock.module(function($translateProvider) {
    languageConfigs.forEach(languageConfig => {
      const lang = languageConfig.value;
      const bundle = require(`../../../../l10n/${lang}.json`);
      $translateProvider.translations(lang, bundle);
    });
    $translateProvider.translationNotFoundIndicatorLeft(TRANSLATION_NOT_FOUND);
  }));

  beforeEach(inject(function ($controller, $rootScope, _$translate_) {
    scope = $rootScope.$new();
    translate = _$translate_;
    $controller('LanguageController', {
      $scope: scope,
      $translate: _$translate_,
    });
  }));


  it('should conform to character length restrictions', () => {
    languageConfigs.forEach(config => {
      const lang = config.value;
      translate.use(lang);
      _.forEach(validations.charLimitCheck, (characterLimit, translationKey) => {
        if (characterLimit > 0) {
          const translation = translate.instant(translationKey);
          if (!translation.startsWith(TRANSLATION_NOT_FOUND)) {
            expect(translation.length).toBeLessThanOrEqual(characterLimit,
          `
          Translation for key "${translationKey}" (${translation})
          in language bundle "${lang}" exceeds the character limit of ${characterLimit}"
          `);
          }
        }
      });
    });
  });

  it('must be configured for character-lenght validation in the meta-informatio file', () => {
    languageConfigs.forEach(config => {
      const lang = config.value;
      const translations = _.keys(translate.getTranslationTable(lang)).filter(t => t.indexOf('careChatTpl.templateConfig.default') > -1);
      translations.forEach(translationKey => {
        expect(_.find(validations.charLimitCheck, (_value, key) => `${key}` === translationKey)).toBeDefined(`
          No validation information present for translation key ${translationKey} in language bundle ${lang}.
          Please specify validation information for ${translationKey} in file "test/fixtures/sunlight/json/configStringValidations.json"
        `);
      });
    });
  });
});
