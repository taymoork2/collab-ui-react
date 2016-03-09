(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('enterEmailAddrController', enterEmailAddrController);

  /* @ngInject */
  function enterEmailAddrController($location, $window, $translate, DigitalRiverService) {

    var vm = this;

    // TODO: Remove this after the go-live.
    vm.drReferrer = $location.search().referrer === DigitalRiverService.getDrReferrer();

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
            $window.location.href = (_.get(result, 'data.data.exists', false) === true ? '/#/dr-login-forward' : '/#/create-account') + '?email=' + vm.email + '&referrer=' + DigitalRiverService.getDrReferrer();
          } else {
            vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
          }
        }, function (result, status) {
          vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
        });
    }

  }
})();
