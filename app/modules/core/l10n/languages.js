(function () {
  'use strict';
  var DEFAULT_LANGUAGE = 'en_US';

  var languages = [{
    value: 'da_DK',
    label: 'languages.danish'
  }, {
    value: 'de_DE',
    label: 'languages.german'
  }, {
    value: 'en_US',
    label: 'languages.englishAmerican'
  }, {
    value: 'en_GB',
    label: 'languages.englishBritish'
  }, {
    value: 'es_ES',
    label: 'languages.spanishSpain'
  }, {
    value: 'es_LA',
    label: 'languages.spanishColumbian'
  }, {
    value: 'fr_FR',
    label: 'languages.french'
  }, {
    value: 'fr_CA',
    label: 'languages.frenchCanadian'
  }, {
    value: 'id_ID',
    label: 'languages.indonesian'
  }, {
    value: 'it_IT',
    label: 'languages.italian'
  }, {
    value: 'ja_JP',
    label: 'languages.japanese'
  }, {
    value: 'ko_KR',
    label: 'languages.korean'
  }, {
    value: 'no_NO',
    label: 'languages.norwegian'
  }, {
    value: 'nl_NL',
    label: 'languages.dutch'
  }, {
    value: 'pl_PL',
    label: 'languages.polish'
  }, {
    value: 'pt_BR',
    label: 'languages.portugueseBrazillian'
  }, {
    value: 'ru_RU',
    label: 'languages.russian'
  }, {
    value: 'sv_SE',
    label: 'languages.swedish'
  }, {
    value: 'tr_TR',
    label: 'languages.turkish'
  }, {
    value: 'zh_CN',
    label: 'languages.chineseMandarin'
  }, {
    value: 'zh_TW',
    label: 'languages.chineseTraditional'
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
      var languageKeys = _.map(languages, 'value');
      var browserLanguage;
      var language;
      var i;

      for (i = 0; i < browserLanguages.length; i++) {
        browserLanguage = browserLanguages[i];
        language = _.find(languageKeys, function (language) {
          return language === browserLanguage;
        }) || _.find(languageKeys, function (language) {
          return _.startsWith(language, browserLanguage);
        });
        if (language) {
          return language;
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
      return language.replace('-', '_');
    }
  }

  module.exports = angular
    .module('core.languages', [])
    .provider('languages', LanguagesProvider)
    .name;

}());
