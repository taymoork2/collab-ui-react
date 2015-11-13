(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController($stateParams, Orgservice, XhrNotificationService) {
    var vm = this;
    vm.org = $stateParams.org;
    Orgservice.getAdminOrg(function (data, status) {
      if (data.success) {
        vm.org = data;
      } else {
        XhrNotificationService.notify(status);
      }
    }, vm.org.id, true);
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
