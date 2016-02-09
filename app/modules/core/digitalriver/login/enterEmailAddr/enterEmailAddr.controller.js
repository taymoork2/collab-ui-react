(function () {
  'use strict';

  angular
    .module('Core')
    .controller('enterEmailAddrController', enterEmailAddrController);

  /* @ngInject */
  function enterEmailAddrController($location, $window, $translate, Userservice) {

    var vm = this;

    // TODO: Remove this after the go-live.
    vm.drReferrer = Userservice.hasDrReferrer();

    vm.emailPlaceholder = function () {
      return $translate.instant('digitalRiver.enterEmailAddr.emailPlaceholder');
    };

    vm.handleEnterEmailAddr = function () {
      if (!vm.email || 0 === vm.email.trim().length) {
        vm.error = $translate.instant('digitalRiver.enterEmailAddr.validation.emptyEmail');
        return;
      }

      Userservice.getUserFromEmail(vm.email)
        .then(function (result) {
          if (result.data.success === true) {
            $window.location.href = (_.get(result, 'data.data.exists', false) === true ? "/#/drLoginForward" : "/#/create-account") + "?email=" + vm.email + "&referrer=digitalriver-ZGlnaXRhbHJpdmVy";
          } else {
            vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
          }
        }, function (result, status) {
          vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
        });
    };

  }
})();
