(function () {
  'use strict';

  angular
    .module('Core')
    .controller('enterEmailAddrController', enterEmailAddrController);

  /* @ngInject */
  function enterEmailAddrController($window, $log, Userservice) {

    var vm = this;

    vm.handleEnterEmailAddr = function () {
      if (!vm.email || 0 === vm.email.trim().length) {
        vm.error = "The email address cannot be blank";
        return;
      }
      Userservice.getUserFromEmail(
        {'email': vm.email},
        function (result, status) {
          if (status != 200 || !result.success) {
            $log.error("getUserFromEmail failed. Status: " + status);
          } else {
            $window.location.href = (result.data.exists === true ? "/#/drLoginForward" : "/#/createAccount") + "?email=" + vm.email;
          }
        }
      );
    };

  }
})();
