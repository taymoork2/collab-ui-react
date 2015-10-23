(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnSetupCtrl', PstnSetupCtrl);

  /* @ngInject */
  function PstnSetupCtrl($state, $stateParams, PstnSetup) {

    PstnSetup.setCustomerId($stateParams.customerId);
    PstnSetup.setCustomerName($stateParams.customerName);

    if ($state.modal && $state.modal.result) {
      $state.modal.result.finally(PstnSetup.clear);
    }
  }
})();
