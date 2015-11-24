(function () {
  'use strict';

  angular.module('WebExSiteSettings').controller('WebExSiteSettingsCtrl', [
    '$scope',
    '$log',
    '$stateParams',
    'Authinfo',
    'WebExSiteSettingsFact',
    function webexSiteSettingsCtrl(
      $scope,
      $log,
      $stateParams,
      Authinfo,
      WebExSiteSettingsFact
    ) {

      $scope.siteUrl = $stateParams.siteUrl;
      $scope.adminEmailParam = Authinfo.getPrimaryEmail();

      $scope.siteSettingsObj = WebExSiteSettingsFact.initSiteSettingsObj();
      $scope.infoCardObj = $scope.siteSettingsObj.siteInfoCardObj;
    } // webexSiteSettingsCtrl()
  ]);
})();
