(function () {
  'use strict';

  angular
    .module('Core')
    .controller('enterEmailAddrController', enterEmailAddrController);

  /* @ngInject */
  function enterEmailAddrController($window, Userservice) {

    var vm = this;

    vm.handleEnterEmailAddr = function () {
      if (!vm.email || 0 === vm.email.trim().length) {
        vm.error = "The email address cannot be blank";
        return;
      }

      Userservice.getUserFromEmail(vm.email)
      .then(function (result) {
            if (result.data.success === true) {
              $window.location.href = (result.data.data.exists === true ? "/#/drLoginForward" : "/#/createAccount") + "?email=" + vm.email;
            } else {
              vm.error = result.data.message;
            }
          }, function (result, status) {
            vm.error = result.data.message;
          });
    };

  }
})();
