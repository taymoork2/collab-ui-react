(function () {
  'use strict';

  angular.module('WebExSiteSettings').controller('WebExSiteSettingsCtrl', [
    '$scope',
    '$log',
    '$translate',
    '$stateParams',
    '$sce',
    'WebExSiteSettingsFact',
    'Notification',
    'Authinfo',
    'Config',
    function (
      $scope,
      $log,
      $translate,
      $stateParams,
      $sce,
      WebExSiteSettingsFact,
      Notification,
      Authinfo,
      Config
    ) {

      // for webex site cross launch
      $scope.siteUrl = $stateParams.siteUrl;
      $scope.webexAdvancedUrl = $sce.trustAsResourceUrl(Config.getWebexAdvancedHomeUrl($stateParams.siteUrl));
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();
      $scope.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();

      $scope.siteSettingsObj = WebExSiteSettingsFact.initSiteSettingsObj();
    }
  ]);
})();
