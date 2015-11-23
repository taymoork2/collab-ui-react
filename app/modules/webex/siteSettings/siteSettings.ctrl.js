(function () {
  'use strict';

  angular.module('WebExSiteSettings').controller('WebExSiteSettingsCtrl', [
    '$scope',
    '$log',
    '$translate',
    '$stateParams',
    '$sce',
    'WebExSiteSettingsFact',
    'Authinfo',
    'Config',
    function webexSiteSettingsCtrl(
      $scope,
      $log,
      $translate,
      $stateParams,
      $sce,
      WebExSiteSettingsFact,
      Authinfo,
      Config
    ) {

      var locale = $translate.use();
      $log.log("WebExSiteSettingsCtrl(): locale=" + locale);

      // for webex site cross launch
      $scope.siteUrl = $stateParams.siteUrl;
      $scope.webexAdvancedUrl = $sce.trustAsResourceUrl(Config.getWebexAdvancedHomeUrl($stateParams.siteUrl));
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();
      $scope.locale = ("es_LA" == locale) ? "es_MX" : locale;

      $scope.siteSettingsObj = WebExSiteSettingsFact.initSiteSettingsObj();
      $scope.infoCardObj = $scope.siteSettingsObj.siteInfoCardObj;
    } // webexSiteSettingsCtrl()
  ]);
})();
