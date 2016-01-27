(function () {
  'use strict';

  angular
    .module('Core')
    .controller('createAccountController', createAccountController);

  /* @ngInject */
  function createAccountController($location, $window, $cookies, Userservice) {

    var vm = this;

    vm.email1 = $location.search().email;

    vm.handleCreateAccount = function () {

      if (!vm.email1 || 0 === vm.email1.trim().length) {
        vm.error = "Empty email";
        return;
      } else if (!vm.password1 || 0 === vm.password1.trim()) {
        vm.error = "Empty password";
        return;
      } else if (vm.email1 !== vm.email2) {
        vm.error = "Emails do not match";
        return;
      } else if (vm.password1 != vm.password2) {
        vm.error = "Passwords do not match";
        return;
      }

      Userservice.addDrUser(
        {
          'email': vm.email1,
          'password': vm.password1
        }
      )
          .then(function (result) {
            if (result.data.success === true) {
              $cookies.atlasDrCookie = result.data.data.token;
              $window.location.href = "https://www.digitalriver.com/";
            } else {
              vm.error = result.data.message;
            }
          }, function (result, status) {
            vm.error = result.data.message;
          });
    }
  }
})();
