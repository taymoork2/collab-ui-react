(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController($stateParams, Orgservice, $log) {
    var vm = this;
    vm.org = $stateParams.org;
    Orgservice.getAdminOrg(function (data, status) {
      if (data.success) {
        vm.org = data;
      } else {
        $log.error('Get org failed. Status: ' + status);
      }
    }, vm.org.id, true);
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
