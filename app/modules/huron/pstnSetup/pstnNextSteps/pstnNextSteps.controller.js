(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnNextStepsCtrl', PstnNextStepsCtrl);

  /* @ngInject */
  function PstnNextStepsCtrl($window, $state, PstnSetup) {
    var vm = this;

    vm.launchCustomerPortal = launchCustomerPortal;

    ////////////////////////

    function launchCustomerPortal() {
      $window.open($state.href('login_swap', {
        customerOrgId: PstnSetup.getCustomerId(),
        customerOrgName: PstnSetup.getCustomerName()
      }));
    }
  }
})();
