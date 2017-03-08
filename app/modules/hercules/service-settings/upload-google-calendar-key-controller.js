(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('UploadGoogleCalendarKeyController', UploadGoogleCalendarKeyController);

  /* @ngInject */
  function UploadGoogleCalendarKeyController($modalInstance, $translate, CloudConnectorService, Notification, aclAccount, googleServiceAccount) {
    var vm = this;
    vm.enterServiceAccountPlaceholder = $translate.instant('hercules.settings.googleCalendar.uploadNewPrivateKeyPlaceholder');
    vm.serviceAccountName = $translate.instant('hercules.settings.googleCalendar.serviceAccountName');

    vm.data = {
      googleServiceAccount: googleServiceAccount,
      aclAccount: aclAccount,
      file: '',
      fileName: '',
    };

    vm.uploadCertificate = function () {
      vm.loading = true;
      CloudConnectorService.updateConfig(vm.data.googleServiceAccount, vm.data.aclAccount, vm.data.file, 'squared-fusion-gcal')
        .then(function () {
          Notification.success($translate.instant('hercules.settings.googleCalendar.successfullyUploadedKey', {
            filename: vm.data.fileName,
          }));
          $modalInstance.close({
            googleServiceAccount: vm.data.googleServiceAccount,
            aclAccount: vm.data.aclAccount,
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.failedToUploadKey');
          vm.loading = false;
        });
    };

  }

}());
