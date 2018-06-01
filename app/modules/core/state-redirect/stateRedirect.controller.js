require('modules/core/shared/cui-panel/cui-panel.scss');

(function () {
  'use strict';

  module.exports = StateRedirectCtrl;

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
