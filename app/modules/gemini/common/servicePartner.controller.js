(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('servicePartnerCtrl', servicePartnerCtrl);

  /* @ngInject */
  function servicePartnerCtrl(gemService, Notification) {
    var vm = this;
    vm.loading = true;
    gemService.getSpData().then(function (res) {
      if (res.length) {
        vm.loading = false;
        vm.data = res;
      } else {
        Notification.error('gemini.msg.splsResponseErr');
      }
    });
  }
})();
