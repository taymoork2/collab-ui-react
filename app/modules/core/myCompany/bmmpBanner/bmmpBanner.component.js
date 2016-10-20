(function () {
  'use strict';

  angular
    .module('Core')
    .component('crBmmpBanner', {
      templateUrl: 'modules/core/myCompany/bmmpBanner/bmmpBanner.tpl.html',
      controller: BmmpBannerCtrl
    });

  ////////////////////

  /* ngInject */
  function BmmpBannerCtrl($scope, $translate, Authinfo, UrlConfig) {
    var vm = this;

    // undocumented parameters provided by BMMP widget team
    var bmmpParams = {
      orgId: Authinfo.getOrgId(),
      locale: $translate.use(),
      appName: 'atlas',
      apiBaseUrl: UrlConfig.getBmmpUrl()
    };

    vm.$onInit = onInit;
    vm.canShow = canShow;
    vm._helpers = {
      initBmmpBanner: initBmmpBanner
    };

    ///////////////////////

    function onInit() {
      initBmmpBanner(bmmpParams);
    }

    function initBmmpBanner(bmmpParams) {
      /* eslint-disable no-undef */
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
