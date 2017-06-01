(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnServiceAddressCtrl', PstnServiceAddressCtrl);

  /* @ngInject */
  function PstnServiceAddressCtrl($state, PstnServiceAddressService, PstnModel, Notification) {
    var vm = this;
    vm.validateAddress = validateAddress;
    vm.hasBackButton = hasBackButton;
    vm.resetAddress = resetAddress;
    vm.next = next;
    vm.modify = modify;
    vm.goBack = goBack;
    vm.loading = false;
    vm.isValid = false;

    init();

    function init() {
      vm.address = _.cloneDeep(PstnModel.getServiceAddress());
      vm.countryCode = PstnModel.getCountryCode();
      // If address has been set in the model, set it as valid
      if (!_.isEmpty(vm.address)) {
        vm.isValid = true;
      }
    }

    function modify() {
      vm.address = {};
      vm.isValid = false;
    }

    function next() {
      if (vm.isValid) {
        goToOrderNumbers();
      } else {
        validateAddress();
      }
    }

    function validateAddress() {
      vm.loading = true;
      PstnServiceAddressService.lookupAddressV2(vm.address, PstnModel.getProviderId())
        .then(function (address) {
          if (address) {
            vm.address = address;
            PstnModel.setServiceAddress(address);
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

    function goToOrderNumbers() {
      $state.go('pstnSetup.orderNumbers');
    }

    function hasBackButton() {
      return (!PstnModel.isCarrierExists() && !PstnModel.isSingleCarrierReseller()) || !PstnModel.isCustomerExists();
    }

    function resetAddress() {
      vm.address = {};
      PstnModel.setServiceAddress(vm.address);
      vm.isValid = false;
    }

    function goBack() {
      if (!PstnModel.isCustomerExists()) {
        $state.go('pstnSetup.contractInfo');
      } else {
        $state.go('pstnSetup');
      }
    }
  }
})();
