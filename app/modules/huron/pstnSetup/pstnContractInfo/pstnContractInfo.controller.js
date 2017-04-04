(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnContractInfoCtrl', PstnContractInfoCtrl);

  /* @ngInject */
  function PstnContractInfoCtrl($state, PstnSetup, FeatureToggleService) {
    var vm = this;
    vm.validateContactInfo = validateContactInfo;
    vm.hasBackButton = hasBackButton;
    vm.goBack = goBack;

    init();

    function init() {
      vm.companyName = PstnSetup.getCustomerName();
      vm.firstName = PstnSetup.getCustomerFirstName();
      vm.lastName = PstnSetup.getCustomerLastName();
      vm.emailAddress = PstnSetup.getCustomerEmail();

      FeatureToggleService.supports(FeatureToggleService.features.huronFederatedSparkCall)
      .then(function (results) {
        vm.ftHuronFederatedSparkCall = results;
      });
    }

    function setCustomerData() {
      PstnSetup.setCustomerName(vm.companyName);
      PstnSetup.setCustomerFirstName(vm.firstName);
      PstnSetup.setCustomerLastName(vm.lastName);
      PstnSetup.setCustomerEmail(vm.emailAddress);
    }

    function validateContactInfo() {
      setCustomerData();
      goToServiceAddress();
    }

    function goToServiceAddress() {
      $state.go('pstnSetup.serviceAddress');
    }

    function hasBackButton() {
      return !PstnSetup.isCarrierExists() && !PstnSetup.isSingleCarrierReseller();
    }

    function goBack() {
      $state.go('pstnSetup');
    }
  }
})();
