(function () {
  'use strict';

  module.exports = MainConfig;

  /* @ngInject */
  function MainConfig($compileProvider) {
    //Add blob to the default angular whitelist
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
  }
}());
