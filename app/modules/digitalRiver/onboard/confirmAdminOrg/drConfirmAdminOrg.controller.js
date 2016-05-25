(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('drConfirmAdminOrgController', drConfirmAdminOrgController);

  /* @ngInject */
  function drConfirmAdminOrgController($location, $state) {

    var vm = this;
    vm.org = $state.params.org;
    vm.site = $state.params.site;

    vm.handleYes = function () {
      vm.error = 'TODO redirect to First Time Setup';
    };

    vm.handleNo = function () {
      vm.error = 'TODO redirect to Screen 11: Provide Alternate Email';
    };

  }
})();
