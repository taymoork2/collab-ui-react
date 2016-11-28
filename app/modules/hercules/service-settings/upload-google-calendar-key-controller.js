(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('UploadGoogleCalendarKeyController', UploadGoogleCalendarKeyController);

  /* @ngInject */
  function UploadGoogleCalendarKeyController($modalInstance, $translate, CloudConnectorService, Notification, googleServiceAccount) {
    var vm = this;
    vm.enterServiceAccountPlaceholder = $translate.instant('hercules.settings.googleCalendar.uploadNewPrivateKeyPlaceholder');
    vm.serviceAccountName = $translate.instant('hercules.settings.googleCalendar.serviceAccountName');

    vm.data = {
      googleServiceAccount: googleServiceAccount,
      file: '',
      fileName: '',
    };

    vm.clearFile = function () {
      vm.data = {
        googleServiceAccount: this.data.googleServiceAccount,
        file: '',
        fileName: '',
      };
    };

    vm.uploadCertificate = function () {
      vm.loading = true;
      CloudConnectorService.updateConfig(vm.data.googleServiceAccount, vm.data.file, 'squared-fusion-gcal')
        .then(function () {
          Notification.success($translate.instant('hercules.settings.googleCalendar.successfullyUploadedKey', {
            filename: vm.data.fileName
          }));
          $modalInstance.close(vm.data.googleServiceAccount);
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.failedToUploadKey');
          vm.loading = false;
        });
    };

  }

}());
