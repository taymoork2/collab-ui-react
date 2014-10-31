'use strict';

angular
  .module('wx2AdminWebClientUnsupportedBrowser', ['pascalprecht.translate'])
  .config(['$translateProvider', '$sceProvider',
    function ($translateProvider, $sceProvider) {
      $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
      });

      //Tell the module what language to use by default
      $translateProvider.preferredLanguage('en_US');

      $sceProvider.enabled(false);
    }
  ]);
