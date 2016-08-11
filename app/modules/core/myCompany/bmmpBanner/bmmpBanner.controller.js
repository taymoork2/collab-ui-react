(function () {
  'use strict';

  angular.module('Core')
    .controller('BmmpBannerCtrl', BmmpBannerCtrl);

  /* ngInject */
  function BmmpBannerCtrl($translate, Authinfo, UrlConfig) {
    var vm = this;

    // undocumented parameters provided by BMMP widget team
    var bmmpParams = {
      orgId: Authinfo.getOrgId(),
      locale: $translate.use(),
      appName: 'atlas',
      apiBaseUrl: UrlConfig.getBmmpUrl()
    };

    vm._helpers = {
      initBmmpBanner: initBmmpBanner
    }

    vm.canShow = canShow;

    init();

    ///////////////////////

    function init() {
      initBmmpBanner(bmmpParams);
    }

    function initBmmpBanner(bmmpParams) {
      bmmp.init(null,
          null,
          bmmpParams.orgId,
          bmmpParams.appName,
          bmmpParams.locale,
          null,
          bmmpParams.apiBaseUrl);
    }

    function canShow() {
      return Authinfo.isOnline();
    }
  }
})();
