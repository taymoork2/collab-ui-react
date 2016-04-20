(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('enterEmailAddrController', enterEmailAddrController);

  /* @ngInject */
  function enterEmailAddrController($location, $window, $translate, $state, Auth, DigitalRiverService) {

    var vm = this;

    vm.drReferrer = ($location.search().referrer === DigitalRiverService.getDrReferrer());
    if (!vm.drReferrer) {
      vm.error = $translate.instant('digitalRiver.createAccount.confirmEmailPlaceholder');
    }
    var sku = $location.search().sku;
    var orderId = $location.search().orderId;
    var campaignId = $location.search().campaignId;

    vm.emailPlaceholder = emailPlaceholder;
    vm.handleEnterEmailAddr = handleEnterEmailAddr;

    function emailPlaceholder() {
      return $translate.instant('digitalRiver.enterEmailAddr.emailPlaceholder');
    }

    function handleEnterEmailAddr() {
      if (!vm.email || 0 === vm.email.trim().length) {
        vm.error = $translate.instant('digitalRiver.enterEmailAddr.validation.emptyEmail');
        return;
      }

      return DigitalRiverService.getUserFromEmail(vm.email)
        .then(function (result) {
          if (_.get(result, 'data.success') === true) {
            var params = {};
            params.referrer = DigitalRiverService.getDrReferrer();
            params.email = vm.email;
            var params2 = {};
            params2.sku = sku;
            params2.orderId = orderId;
            params2.campaignId = campaignId;
            params.params = params2;
            if (_.get(result, 'data.data.exists', false) === true) {
              // user exists
              params.redirect = "submitOrder";
              $state.go('drLoginForward', params);
            } else {
              // user doesn't exist so go to Create Account page
              $state.go('createAccount', params);
            }
          } else {
            vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
          }
        }, function (result) {
          vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
        });
    }

  }
})();
