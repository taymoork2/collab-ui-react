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
    } else if (!angular.isDefined($stateParams.params.sku)) {
      vm.error = $translate.instant('digitalRiver.validation.missingSKU');
    } else {
      vm.confirmEmailPlaceholder = confirmEmailPlaceholder;
      vm.passwordPlaceholder = passwordPlaceholder;
      vm.confirmPasswordPlaceholder = confirmPasswordPlaceholder;
      vm.handleCreateAccount = handleCreateAccount;
      vm.handleCancel = handleCancel;

      vm.originalEmail = $stateParams.email;
      vm.email1 = $stateParams.email;

      var params = {};
      params.email = vm.email1;
      params.referrer = DigitalRiverService.getDrReferrer();
      var innerParams = {};
      innerParams.sku = $stateParams.params.sku;
      innerParams.orderId = $stateParams.params.orderId;
      innerParams.campaignId = $stateParams.params.campaignId;
      params.params = innerParams;
    }

    function confirmEmailPlaceholder() {
      return $translate.instant('digitalRiver.createAccount.confirmEmailPlaceholder');
    }

    function passwordPlaceholder() {
      return $translate.instant('digitalRiver.createAccount.passwordPlaceholder');
    }

    function confirmPasswordPlaceholder() {
      return $translate.instant('digitalRiver.createAccount.confirmPasswordPlaceholder');
    }

    function showError(result) {
      vm.loading = false;
      vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
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

      if (vm.email1 !== vm.email) {
        vm.loading = true;
        DigitalRiverService.userExists(vm.email1)
          .then(function (result) {
            vm.loading = false;
            if (!angular.isDefined(result)) {
              vm.error = $translate.instant('digitalRiver.validation.unexpectedError');
              return;
            } else if (result.error !== null) {
              vm.error = result.error;
              return;
            } else if (result.domainClaimed) {
              vm.error = $translate.instant('digitalRiver.enterEmailAddr.domainClaimed');
              return;
            } else if (result.userExists) {
              vm.error = $translate.instant('digitalRiver.createAccount.validation.accountExists');
              return;
            }
            createAccount();
          }).catch(function (result) {
            vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
            return;
          }).finally(function (result) {
            vm.loading = false;
          });
      } else {
        createAccount();
      }
    }

    function createAccount() {
      vm.loading = true;
      DigitalRiverService.addDrUser({
          'email': vm.email1,
          'password': vm.password1
        })
        .then(function (result) {
          vm.loading = false;
          if (_.get(result, 'data.success') === true) {
            var token = _.get(result, 'data.data.token', 'error');

            DigitalRiverService.decrytpUserAuthToken({
                'sessionToken': token
              })
              .then(function (result) {
                if (_.get(result, 'status') === 200) {
                  var uuid = _.get(result, 'data.userKey.userID');
                  if (angular.isDefined(uuid)) {
                    params.params.uuid = uuid;
                    $state.go('submitOrder', params);
                  }
                }
                // we'll only reach here in an error case
                showError(result);
              }).catch(function (result) {
                showError(result);
              });
          } else {
            showError(result);
          }
        }).catch(function (result) {
          showError(result);
        }).finally(function (result) {
          vm.loading = false;
        });
    }

    function handleCancel() {
      vm.error = "TODO Should take user back to initial login page";
    }
  }

})();
