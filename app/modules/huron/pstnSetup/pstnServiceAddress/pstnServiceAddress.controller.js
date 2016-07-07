(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnServiceAddressCtrl', PstnServiceAddressCtrl);

  /* @ngInject */
  function PstnServiceAddressCtrl($state, PstnServiceAddressService, PstnSetup, Notification) {
    var vm = this;
    vm.validateAddress = validateAddress;
    vm.hasBackButton = hasBackButton;
    vm.modify = modify;
    vm.goBack = goBack;
    vm.loading = false;
    vm.isValid = false;

    init();

    function init() {
      vm.address = angular.copy(PstnSetup.getServiceAddress());
      // If address has been set in the model, set it as valid
      if (!_.isEmpty(vm.address)) {
        vm.isValid = true;
      }
    }

    function modify() {
      vm.address = {};
      vm.isValid = false;
    }

    function validateAddress() {
      if (vm.isValid) {
        goToOrderNumbers();
      } else {
        vm.loading = true;
        PstnServiceAddressService.lookupAddress(vm.address)
          .then(function (address) {
            if (address) {
              vm.address = address;
              PstnSetup.setServiceAddress(address);
              vm.isValid = true;
            } else {
              Notification.error('pstnSetup.serviceAddressNotFound');
            }
          })
          .catch(function (response) {
            Notification.errorResponse(response);
          })
          .finally(function () {
            vm.loading = false;
          });
      }
    }

    function goToOrderNumbers() {
      $state.go('pstnSetup.orderNumbers');
    }

    function hasBackButton() {
      return (!PstnSetup.isCarrierExists() && !PstnSetup.isSingleCarrierReseller()) || !PstnSetup.isCustomerExists();
    }

    function goBack() {
      if (!PstnSetup.isCustomerExists()) {
        $state.go('pstnSetup.contractInfo');
      } else {
        $state.go('pstnSetup');
      }
    }
  }
})();
