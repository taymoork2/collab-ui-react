(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnNextStepsCtrl', PstnNextStepsCtrl);

  /* @ngInject */
  function PstnNextStepsCtrl($window, $state, $stateParams, $scope, PstnModel, TerminusOrderService) {
    var vm = this;

    vm.launchCustomerPortal = launchCustomerPortal;
    vm.portOrders = $stateParams.portOrders;
    vm.pstnOrders = [];
    vm.isTrial = PstnModel.getIsTrial();
    vm.dismissModal = dismissModal;

    getOrders();

    function getOrders() {
      return TerminusOrderService.query({
        customerId: PstnModel.getCustomerId(),
        type: 'PSTN',
      }).$promise.then(function (response) {
        vm.pstnOrders = response;
      });
    }

    ////////////////////////

    function launchCustomerPortal() {
      $window.open($state.href('login', {
        customerOrgId: PstnModel.getCustomerId(),
      }));
    }

    function dismissModal() {
      PstnModel.clear();
      $scope.$dismiss();
    }
  }
})();
