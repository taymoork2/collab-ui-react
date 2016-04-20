(function () {
  'use strict';

  var languages = [{
    value: 'da_DK',
    label: 'languages.danish'
  }, {
    value: 'de_DE',
    label: 'languages.german'
  }, {
    value: 'en_GB',
    label: 'languages.englishBritish'
  }, {
    value: 'en_US',
    label: 'languages.englishAmerican'
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

  angular
    .module('Core')
    .value('languages', languages);

}());
