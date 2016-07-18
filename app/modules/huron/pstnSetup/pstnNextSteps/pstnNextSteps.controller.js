(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnNextStepsCtrl', PstnNextStepsCtrl);

  /* @ngInject */
  function PstnNextStepsCtrl($window, $state, $stateParams, PstnSetup, TerminusOrderService) {
    var vm = this;

    vm.launchCustomerPortal = launchCustomerPortal;
    vm.portOrders = $stateParams.portOrders;
    vm.pstnOrders = [];

    getOrders();

    function getOrders() {
      return TerminusOrderService.query({
        customerId: PstnSetup.getCustomerId(),
        type: "PSTN"
      }).$promise.then(function (response) {
        vm.pstnOrders = response;
      });
    }

    ////////////////////////

    function launchCustomerPortal() {
      $window.open($state.href('login_swap', {
        customerOrgId: PstnSetup.getCustomerId(),
        customerOrgName: PstnSetup.getCustomerName()
      }));
    }
  }
})();
