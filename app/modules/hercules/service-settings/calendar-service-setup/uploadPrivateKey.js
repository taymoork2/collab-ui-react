(function () {
  'use strict';

  angular
    .module('Hercules')
    .component('uploadPrivateKey', {
      templateUrl: 'modules/hercules/service-settings/calendar-service-setup/uploadPrivateKey.html',
      controller: uploadPrivateKeyController,
      controllerAs: 'uploadKey',
      bindings: {
        data: '=',
      }
    });

  /* @ngInject */
  function uploadPrivateKeyController($translate) {
    var vm = this;
    vm.enterServiceAccountPlaceholder = $translate.instant('hercules.settings.googleCalendar.uploadNewPrivateKeyPlaceholder');
    vm.serviceAccountName = $translate.instant('hercules.settings.googleCalendar.serviceAccountName');

    vm.clearFile = function () {
      vm.data = {
        googleServiceAccount: this.data.googleServiceAccount,
        file: '',
        fileName: '',
      };
    };

    vm.warnInvalidCertificate = function () {
      return !_.startsWith(vm.data.file, 'data:application/x-pkcs12;base64');
    };

  }

}());
