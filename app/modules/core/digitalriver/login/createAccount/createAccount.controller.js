(function () {
  'use strict';

  angular
    .module('Core')
    .controller('createAccountController', createAccountController);

  /* @ngInject */
  function createAccountController($location, $window, $cookies, $translate, DigitalRiverService) {

    var vm = this;

    // TODO: Remove this after the go-live.
    vm.drReferrer = $location.search().referrer === DigitalRiverService.getDrReferrer();

    vm.email1 = _.get($location.search(), 'email', '').replace(/\s+/g, '+');

    vm.confirmPlaceholder = function () {
      return $translate.instant('digitalRiver.createAccount.confirmPlaceholder');
    };

    vm.handleCreateAccount = function () {

      if (!vm.email1 || 0 === vm.email1.trim().length) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.emptyEmail');
        return;
      } else if (!vm.password1 || 0 === vm.password1.trim()) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.emptyPassword');
        return;
      } else if (vm.email1 !== vm.email2) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.emailsDontMatch');
        return;
      } else if (vm.password1 != vm.password2) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.passwordsDontMatch');
        return;
      }

      DigitalRiverService.addDrUser({
          'email': vm.email1,
          'password': vm.password1
        })
        .then(function (result) {
          if (result.data.success === true) {
            $cookies.atlasDrCookie = _.get(result, 'data.data.token', 'error');
            $window.location.href = "https://www.digitalriver.com/";
          } else {
            vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
          }
        }, function (result, status) {
          vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
        });
    };
  }
})();
