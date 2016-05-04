(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('drOrgNameController', drOrgNameController);

  /* @ngInject */
  function drOrgNameController($location, $state, $translate) {

    var vm = this;
    vm.email = $state.params.email;

    vm.handleContinue = function () {
      if (!vm.orgName || 0 === vm.orgName.trim().length) {
        vm.error = $translate.instant('digitalRiver.orgName.missingOrgName');
        return;
      }
      vm.error = "TODO create org, move user to org and then redirect to First Time Exp";
    };

  }
})();
