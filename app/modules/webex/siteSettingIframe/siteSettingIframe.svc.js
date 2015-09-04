'use strict';

angular.module('WebExSiteSettingIframe').service('WebExSiteSettingIframeSvc', [
  function WebExSiteSettingIframeModel() {
    return {
      viewReady: false,
      hasLoadError: false,
      sessionTicketError: false,
      errMsg: "",

      siteUrl: null,
      settingPageIframeUrl: null
    }; // return
  } // WebExSiteSettingIframeModel
]);
