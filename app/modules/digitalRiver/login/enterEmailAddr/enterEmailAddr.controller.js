(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('enterEmailAddrController', enterEmailAddrController);

  /* @ngInject */
  function enterEmailAddrController($location, $window, $translate, $state, Auth, DigitalRiverService) {

    var vm = this;
    vm.loading = false;

    vm.drReferrer = ($state.params.referrer === DigitalRiverService.getDrReferrer());
    if (!vm.drReferrer) {
      vm.error = $translate.instant('digitalRiver.restrictedPage');
    } else {
      var sku = $state.params.sku;
      var orderId = $state.params.orderId;
      var campaignId = $state.params.campaignId;

      vm.emailPlaceholder = emailPlaceholder;
      vm.handleEnterEmailAddr = handleEnterEmailAddr;
    }

    function emailPlaceholder() {
      return $translate.instant('digitalRiver.enterEmailAddr.emailPlaceholder');
    }

    function handleEnterEmailAddr() {
      if (!vm.email || 0 === vm.email.trim().length) {
        vm.error = $translate.instant('digitalRiver.enterEmailAddr.validation.emptyEmail');
        return;
      }

      vm.loading = true;
      DigitalRiverService.userExists(vm.email)
        .then(function (result) {
          vm.loading = false;
          if (result.error) {
            vm.error = result.error;
          } else if (result.domainClaimed) {
            vm.error = $translate.instant('digitalRiver.enterEmailAddr.domainClaimed');
          } else {
            var params = {};
            params.referrer = DigitalRiverService.getDrReferrer();
            params.email = vm.email;
            var innerParams = {};
            innerParams.sku = sku;
            innerParams.orderId = orderId;
            innerParams.campaignId = campaignId;
            params.params = innerParams;

            if (result.userExists) {
              params.redirect = "submitOrder";
              $state.go('drLoginForward', params);
            } else {
              $state.go('createAccount', params);
            }
          }
        }).catch(function (result) {
          vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
        }).finally(function (result) {
          vm.loading = false;
        });
    }

  }
})();
