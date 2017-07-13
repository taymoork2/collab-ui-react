(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnContractInfoCtrl', PstnContractInfoCtrl);

  /* @ngInject */
  function PstnContractInfoCtrl($state, PstnModel) {
    var vm = this;
    vm.validateContactInfo = validateContactInfo;
    vm.hasBackButton = hasBackButton;
    vm.goBack = goBack;

    init();

    function init() {
      vm.companyName = PstnModel.getCustomerName();
      vm.firstName = PstnModel.getCustomerFirstName();
      vm.lastName = PstnModel.getCustomerLastName();
      vm.emailAddress = PstnModel.getCustomerEmail();
    }

    function setCustomerData() {
      PstnModel.setCustomerName(vm.companyName);
      PstnModel.setCustomerFirstName(vm.firstName);
      PstnModel.setCustomerLastName(vm.lastName);
      PstnModel.setCustomerEmail(vm.emailAddress);
    }

    function validateContactInfo() {
      setCustomerData();
      goToServiceAddress();
    }

    function goToServiceAddress() {
      $state.go('pstnSetup.serviceAddress');
    }

    function hasBackButton() {
      return !PstnModel.isCarrierExists() && !PstnModel.isSingleCarrierReseller();
    }

    function goBack() {
      $state.go('pstnSetup');
    }
  }
})();
