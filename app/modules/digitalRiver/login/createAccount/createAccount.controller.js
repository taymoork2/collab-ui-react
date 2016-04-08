(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('createAccountController', createAccountController);

  /* @ngInject */
  function createAccountController($location, $window, $cookies, $translate, $state, $stateParams, Log, DigitalRiverService) {

    var vm = this;
    vm.drReferrer = ($stateParams.referrer === DigitalRiverService.getDrReferrer());
    if (!vm.drReferrer) {
      vm.error = $translate.instant('digitalRiver.restrictedPage');
    }
    vm.confirmEmailPlaceholder = confirmEmailPlaceholder;
    vm.passwordPlaceholder = passwordPlaceholder;
    vm.confirmPasswordPlaceholder = confirmPasswordPlaceholder;
    vm.handleCreateAccount = handleCreateAccount;

    vm.email = $stateParams.email;
    vm.email1 = $stateParams.email;

    function confirmEmailPlaceholder() {
      return $translate.instant('digitalRiver.createAccount.confirmEmailPlaceholder');
    }

    function passwordPlaceholder() {
      return $translate.instant('digitalRiver.createAccount.passwordPlaceholder');
    }

    function confirmPasswordPlaceholder() {
      return $translate.instant('digitalRiver.createAccount.confirmPasswordPlaceholder');
    }

    function handleCreateAccount() {
      if (!vm.email1 || 0 === vm.email1.trim().length || !vm.email2 || 0 === vm.email2.trim().length) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.emptyEmail');
        return;
      } else if (vm.email1 !== vm.email2) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.emailsDontMatch');
        return;
      } else if (!vm.password1 || 0 === vm.password1.trim() || !vm.password2 || 0 === vm.password2.trim()) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.emptyPassword');
        return;
      } else if (vm.password1 !== vm.password2) {
        vm.error = $translate.instant('digitalRiver.createAccount.validation.passwordsDontMatch');
        return;
      }

      return DigitalRiverService.addDrUser({
          'email': vm.email1,
          'password': vm.password1
        })
        .then(function (result) {
          if (_.get(result, 'data.success') === true) {
            var token = _.get(result, 'data.data.token', 'error');

            DigitalRiverService.decrytpUserAuthToken({
                'sessionToken': token
              })
              .then(function (result) {
                if (_.get(result, 'status') === 200) {
                  var uuid = _.get(result, 'data.userKey.userID');
                  if (angular.isDefined(uuid)) {
                    var params = {};
                    params.email = vm.email1;
                    params.referrer = DigitalRiverService.getDrReferrer();
                    var innerParams = {};
                    innerParams.uuid = uuid;
                    innerParams.sku = $stateParams.params.sku;
                    innerParams.orderId = $stateParams.params.orderId;
                    innerParams.campaignId = $stateParams.params.campaignId;
                    params.params = innerParams;
                    $state.go('submitOrder', params);
                  }
                }
                // we'll only reach here in an error case
                vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
              }).catch(function (result) {
                vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
              });
          } else {
            vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
          }
        }).catch(function (result) {
          vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
        });
    }
  }
})();
