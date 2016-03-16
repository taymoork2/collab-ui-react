(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('createAccountController', createAccountController);

  /* @ngInject */
  function createAccountController($location, $window, $cookies, $translate, DigitalRiverService) {

    var vm = this;
    vm.confirmPlaceholder = confirmPlaceholder;
    vm.handleCreateAccount = handleCreateAccount;

    // TODO: Remove this after the go-live.
    vm.drReferrer = $location.search().referrer === DigitalRiverService.getDrReferrer();

    vm.email1 = _.get($location.search(), 'email', '').replace(/\s+/g, '+');

    function confirmPlaceholder() {
      return $translate.instant('digitalRiver.createAccount.confirmPlaceholder');
    }

    function handleCreateAccount() {
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

      return DigitalRiverService.addDrUser({
          'email': vm.email1,
          'password': vm.password1
        })
        .then(function (result) {
          if (_.get(result, 'data.success') === true) {
            $cookies.atlasDrCookie = _.get(result, 'data.data.token', 'error');
            $window.location.href = 'https://www.digitalriver.com/';
          } else {
            vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
          }
        }).catch(function (result, status) {
          vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
        });
    }
  }
})();
