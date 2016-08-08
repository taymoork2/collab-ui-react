(function () {
  'use strict';

  module.exports = angular.module('core.stateredirect', [
    require('modules/core/auth/auth'),
    require('modules/core/stateRedirect/previousState.service'),
  ])
    .controller('StateRedirectCtrl', StateRedirectCtrl)
    .name;

  /* @ngInject */
  function StateRedirectCtrl(Auth, PreviousState) {
    var vm = this;

    vm.logout = logout;
    vm.performRedirect = performRedirect;
    vm.hasPreviousState = PreviousState.isValid();
    vm.loading = false;

    function logout() {
      vm.loading = true;
      Auth.logout();
    }

    function performRedirect() {
      if (vm.hasPreviousState) {
        PreviousState.go();
      } else {
        logout();
      }
    }
  }

})();
