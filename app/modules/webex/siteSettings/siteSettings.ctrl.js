(function () {
  'use strict';

  angular.module('WebExSiteSettings').controller('WebExSiteSettingsCtrl', [
    '$scope',
    '$rootScope',
    '$log',
    '$translate',
    '$filter',
    '$state',
    '$stateParams',
    '$sce',
    'WebExSiteSettingsFact',
    'Notification',
    'Authinfo',
    'Config',

    function (
      $scope,
      $rootScope,
      $log,
      $translate,
      $filter,
      $state,
      $stateParams,
      $sce,
      WebExSiteSettingsFact,
      Notification,
      Authinfo,
      Config
    ) {

      this.siteSettingsObj = WebExSiteSettingsFact.getSiteSettingsObj();

      // for webex site cross launch 
      $scope.webexAdvancedUrl = $sce.trustAsResourceUrl(Config.getWebexAdvancedHomeUrl($stateParams.siteUrl));
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();
      $scope.locale = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();

      this.siteSettingsObj = WebExSiteSettingsFact.initSiteSettingsObj();
    }
  ]);
})();
