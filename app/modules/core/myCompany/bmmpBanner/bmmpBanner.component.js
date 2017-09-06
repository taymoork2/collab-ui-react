(function () {
  'use strict';

  angular
    .module('Core')
    .component('crBmmpBanner', {
      template: require('modules/core/myCompany/bmmpBanner/bmmpBanner.tpl.html'),
      controller: BmmpBannerCtrl,
    });

  ////////////////////

  /* ngInject */
  function BmmpBannerCtrl($scope, $translate, Authinfo, BmmpService) {
    var vm = this;

    // undocumented parameters provided by BMMP widget team
    var bmmpParams = {
      userId: Authinfo.getUserId(),
      locale: $translate.use(),
      appName: 'atlas',
      apiBaseUrl: BmmpService.getBmmpUrl(),
    };

    vm.$onInit = onInit;
    vm.canShow = canShow;
    vm._helpers = {
      initBmmpBanner: initBmmpBanner,
    };

    ///////////////////////

    function onInit() {
      initBmmpBanner(bmmpParams);
    }

    function initBmmpBanner(bmmpParams) {
      /* eslint-disable no-undef */
      bmmp.init(null,
        null,
        bmmpParams.userId,
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
