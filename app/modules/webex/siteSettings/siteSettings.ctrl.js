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
    'Notification',
    'WebExSiteSettingsFact',
    function (
      $scope,
      $rootScope,
      $log,
      $translate,
      $filter,
      $state,
      $stateParams,
      Notification,
      WebExSiteSettingsFact
    ) {

      $log.log("Site Settings Index Page");

      this.siteSettingsModel = WebExSiteSettingsFact.initSiteSettingsModel();

    }
  ]);
})();
