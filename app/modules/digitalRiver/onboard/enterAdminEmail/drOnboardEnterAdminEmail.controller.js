(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('drOnboardEnterAdminEmailController', drOnboardEnterAdminEmailController);

  /* @ngInject */
  function drOnboardEnterAdminEmailController($location, $state, $translate, DigitalRiverService) {

    var vm = this;
    vm.isSubmitted = false;

    vm.emailPlaceholder = emailPlaceholder;
    vm.confirmEmailPlaceholder = confirmEmailPlaceholder;
    vm.handleEnterEmailAddr = handleEnterEmailAddr;

    function emailPlaceholder() {
      return $translate.instant('digitalRiver.enterEmailAddr.emailPlaceholder');
    }

    function confirmEmailPlaceholder() {
      return $translate.instant('digitalRiver.createAccount.confirmEmailPlaceholder');
    }

    function handleEnterEmailAddr() {
      vm.error = null;
      if (!vm.email1 || 0 === vm.email1.trim().length || !vm.email2 || 0 === vm.email2.trim().length) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.emptyEmail');
        return;
      } else if (vm.email1 !== vm.email2) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.emailsDontMatch');
        return;
      }
      //TODO send email. replace params with buyer's UUID and orderId
      DigitalRiverService.sendDRWelcomeEmail(vm.email1, "cb1e6f50-b61f-4685-8d0e-a39a6ae9afec", "A123");
      vm.isSubmitted = true;
      vm.status = $translate.instant('digitalRiver.sentEmail') + ' ' + vm.email1;

      return;
    }

  }
})();
