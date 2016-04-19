(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('drOnboardQuestionController', drOnboardQuestionController);

  /* @ngInject */
  function drOnboardQuestionController($location, $state) {

    var vm = this;
    vm.email = $state.params.email;

    vm.handleYes = function () {
      $state.go('drOrgName', {
        email: vm.email
      });
    };

    vm.handleNo = function () {
      $state.go('drOnboardEnterAdminEmail');
    };

  }
})();
