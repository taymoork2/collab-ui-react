(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('drOrgNameController', drOrgNameController);

  /* @ngInject */
  function drOrgNameController($location, $state) {

    var vm = this;
    vm.email = $state.params.email;

    vm.handleContinue = function () {
      //TODO create org, move user to this org
      vm.error = "TODO create org, move user to org and then redirect to First Time Exp";
    };

  }
})();
