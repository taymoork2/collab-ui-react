(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('adminChoicesController', adminChoicesController);

  /* @ngInject */
  function adminChoicesController($state, $translate, DigitalRiverService) {

    var vm = this;

    //TODO why isn't $translate working here? hard-coding text for now.
    vm.choice1 = $translate.instant('digitalRiver.adminChoices.header1');
    vm.choice2 = $translate.instant('digitalRiver.adminChoices.choice2');
    vm.choice3 = $translate.instant('digitalRiver.adminChoices.choice3');

    vm.choice1a = 'Send a request to receive admin privileges';
    vm.choice1b = 'Once you have been assigned admin privileges you can restart the process by clicking on the button in the Welcome email again or going to the <Screen 15> page.';
    vm.choice2 = 'Allow the Admin of this organization to manage the service(s) I purchased';
    vm.choice3a = 'Create a new organization to manage the service(s)';
    vm.choice3b = 'Note you will not be able to assign Spark licenses you just purchased to anyone in your current organization if you choose this option.';

    vm.handleContinue = function () {
      if (vm.choice === '1') {
        vm.error = 'TODO show Thank You page';
      } else if (vm.choice === '2') {
        $state.go('drOnboardEnterAdminEmail');
      } else if (vm.choice === '3') {
        var params = {};
        params.referrer = DigitalRiverService.getDrReferrer();
        $state.go('enterEmailAddr', params);
      }
    };

  }
})();
