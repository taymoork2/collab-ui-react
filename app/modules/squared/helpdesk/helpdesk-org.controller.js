(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController($stateParams, OrgService) {
    var vm = this;
    vm.org = $stateParams.org;
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
