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
      this.siteSettingsObj = WebExSiteSettingsFact.initSiteSettingsObj();

      // for webex site cross launch 
      $scope.webexAdvancedUrl = $sce.trustAsResourceUrl(Config.getWebexAdvancedHomeUrl(this.siteSettingsObj.siteUrl));
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();
      $scope.localeParam = $translate.use();
    }
  ]);
})();
