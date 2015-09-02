(function () {
  'use strict';

  angular.module('WebExSiteSettingIframe').factory('WebExSiteSettingIframeFact', [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    '$filter',
    'Authinfo',
    'WebExUtilsFact',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    'WebExSiteSettingIframeSvc',
    'Notification',
    function (
      $q,
      $log,
      $stateParams,
      $translate,
      $filter,
      Authinfo,
      WebExUtilsFact,
      WebExXmlApiFact,
      webExXmlApiInfoObj,
      webExSiteSettingIframeObj,
      Notification
    ) {
      return {
        getSiteSettingIframeObj: function () {
          return webExSiteSettingIframeObj;
        }, // getSiteSettingIframeObj

        initSiteSettingIframeObj: function () {
          webExSiteSettingIframeObj.siteUrl = $stateParams.siteUrl;
          webExSiteSettingIframeObj.iframeUrl = $stateParams.settingPageIframeUrl;
          webExSiteSettingIframeObj.viewReady = true;

          return webExSiteSettingIframeObj;
        }, // initSiteSettingIframeObj
      }; // return
    } // function()
  ]);
})();
