(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('drOnboardEnterAdminEmailController', drOnboardEnterAdminEmailController);

  /* @ngInject */
  function drOnboardEnterAdminEmailController($location, $state, $translate, DigitalRiverService) {

    var vm = this;

    vm.emailPlaceholder = emailPlaceholder;
    vm.handleEnterEmailAddr = handleEnterEmailAddr;

    function emailPlaceholder() {
      return $translate.instant('digitalRiver.enterEmailAddr.emailPlaceholder');
    }

    function handleEnterEmailAddr() {
      if (!vm.email || 0 === vm.email.trim().length) {
        vm.error = $translate.instant('digitalRiver.enterEmailAddr.validation.emptyEmail');
        return;
      }

      //TODO send email. Note: need API to allow User role users to send emails
      //DigitalRiverService.sendDRWelcomeEmail(vm.email, "f62ded1b-b9a6-4ef4-8f07-a6c29b88e21b", "A123");
      vm.error = 'TODO send email';

      return;
    }

  }
})();
