(function () {
  'use strict';

  angular.module('WebExApp').controller('WebExSiteSettingsCtrl', WebExSiteSettingsCtrl);

  /* @ngInject */
  function WebExSiteSettingsCtrl(
    $scope,
    $stateParams,
    Authinfo,
    WebExSiteSettingsFact
  ) {

    $scope.siteUrl = $stateParams.siteUrl;
    $scope.adminEmailParam = Authinfo.getPrimaryEmail();

    $scope.siteSettingsObj = WebExSiteSettingsFact.initSiteSettingsObj();
    $scope.infoCardObj = $scope.siteSettingsObj.siteInfoCardObj;
  } // webexSiteSettingsCtrl()
})();
