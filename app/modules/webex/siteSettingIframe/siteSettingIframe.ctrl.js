(function () {
  'use strict';

  angular.module('WebExSiteSettingIframe').controller('WebExSiteSettingIframeCtrl', [
    '$scope',
    '$rootScope',
    '$log',
    '$translate',
    '$filter',
    '$state',
    '$stateParams',
    'WebExSiteSettingIframeFact',
    'Notification',
    function (
      $scope,
      $rootScope,
      $log,
      $translate,
      $filter,
      $state,
      $stateParams,
      WebExSiteSettingIframeFact,
      Notification
    ) {

      this.siteSettingIframeObj = WebExSiteSettingIframeFact.getSiteSettingIframeObj();
      this.siteSettingIframeObj = WebExSiteSettingIframeFact.initSiteSettingIframeObj();
    }
  ]);
})();
