(function () {
  'use strict';

  var DEFAULT_LANGUAGE = 'en_US';

  var languages = [{
    value: 'da_DK',
    label: 'languages.danish',
    browserCodes: ['da_DK', 'da'],
  }, {
    value: 'de_DE',
    label: 'languages.german',
    browserCodes: ['de_DE', 'de', 'de_AT', 'de_CH'],
  }, {
    value: 'en_US',
    label: 'languages.englishAmerican',
    browserCodes: ['en_US', 'en'],
  }, {
    value: 'en_GB',
    label: 'languages.englishBritish',
    browserCodes: ['en_GB', 'en_IE'],
  }, {
    value: 'es_ES',
    label: 'languages.spanishSpain',
    browserCodes: ['es_ES', 'es'],
  }, {
    value: 'es_CO',
    label: 'languages.spanishColumbian',
    browserCodes: ['es_CO', 'es_419', 'es_XL', 'es_MX'],
  }, {
    value: 'fr_FR',
    label: 'languages.french',
    browserCodes: ['fr_FR', 'fr', 'fr_CH', 'fr_BE'],
  }, {
    value: 'fr_CA',
    label: 'languages.frenchCanadian',
    browserCodes: ['fr_CA'],
  }, {
    value: 'id_ID',
    label: 'languages.indonesian',
    browserCodes: ['id_ID', 'id'],
  }, {
    value: 'it_IT',
    label: 'languages.italian',
    browserCodes: ['it_IT', 'it', 'it_CH'],
  }, {
    value: 'ja_JP',
    label: 'languages.japanese',
    browserCodes: ['ja_JP', 'ja'],
  }, {
    value: 'ko_KR',
    label: 'languages.korean',
    browserCodes: ['ko_KR', 'ko'],
  }, {
    value: 'nb_NO',
    label: 'languages.norwegian',
    browserCodes: ['nb_NO', 'nb', 'no', 'nn', 'nn_NO'],
  }, {
    value: 'nl_NL',
    label: 'languages.dutch',
    browserCodes: ['nl_NL', 'nl', 'nl_BE'],
  }, {
    value: 'pl_PL',
    label: 'languages.polish',
    browserCodes: ['pl_PL', 'pl'],
  }, {
    value: 'pt_BR',
    label: 'languages.portugueseBrazillian',
    browserCodes: ['pt_BR', 'pt', 'pt_PT'],
  }, {
    value: 'ru_RU',
    label: 'languages.russian',
    browserCodes: ['ru_RU', 'ru'],
  }, {
    value: 'sv_SE',
    label: 'languages.swedish',
    browserCodes: ['sv_SE', 'sv'],
  }, {
    value: 'tr_TR',
    label: 'languages.turkish',
    browserCodes: ['tr_TR', 'tr'],
  }, {
    value: 'zh_CN',
    label: 'languages.chineseMandarin',
    browserCodes: ['zh_CN', 'zh'],
  }, {
    value: 'zh_TW',
    label: 'languages.chineseTraditional',
    browserCodes: ['zh_TW'],
  }];

  /* @ngInject */
  function LanguagesProvider($windowProvider) {

    this.$get = $get;
    this.getFallbackLanguage = getFallbackLanguage;
    this.getPreferredLanguage = getPreferredLanguage;

    function $get() {
      return languages;
    }

    function getFallbackLanguage() {
      return DEFAULT_LANGUAGE;
    }

    function getPreferredLanguage() {
      var browserLanguages = _.flatten([
        getBrowserLanguage(),
        DEFAULT_LANGUAGE,
      ]);
      var browserLanguage;
      var language;
      var i;

      var isBrowserLanguage = function (language) {
        return _.includes(language.browserCodes, browserLanguage);
      };

      var startsWithBrowserLanguage = function (language) {
        return _.find(language.browserCodes, function (browserCode) {
          return _.startsWith(browserCode, browserLanguage);
        });
      };

      for (i = 0; i < browserLanguages.length; i++) {
        browserLanguage = browserLanguages[i];
        language = _.find(languages, isBrowserLanguage) || _.find(languages, startsWithBrowserLanguage);
        if (language) {
          return language.value;
        }
      }

      return DEFAULT_LANGUAGE;
    }

    function getBrowserLanguage() {
      var browserLanguageProperties = [
        'languages',
        'language',
        'browserLanguage',
        'systemLanguage',
        'userLanguage',
      ];
      var navigator = $windowProvider.$get().navigator;
      var language;
      var i;

      for (i = 0; i < browserLanguageProperties.length; i++) {
        language = _.get(navigator, browserLanguageProperties[i]);
        if (_.isArray(language)) {
          return _.map(language, formatLanguage);
        } else if (_.isString(language)) {
          return formatLanguage(language);
        }
      }

      return DEFAULT_LANGUAGE;
    }

    function formatLanguage(language) {
      var userLangSplit = _.split(language, /[-_]+/, 2);
      if (userLangSplit.length <= 1) {
        return language;
      }

      return _.toLower(userLangSplit[0]) + '_' + _.toUpper(userLangSplit[1]);
    }
  }

  module.exports = angular
    .module('core.languages', [])
    .provider('languages', LanguagesProvider)
    .name;

}());
