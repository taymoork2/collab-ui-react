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

      $scope.webexAdvancedUrl = Config.getWebexAdvancedHomeUrl(this.siteSettingsObj.siteUrl);
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();
      $scope.localeParam = $translate.use();
      
      $scope.trustSrc = function (src) {
          return $sce.trustAsResourceUrl(src);
        }; // trustSrc()
    }
  ]);
})();
