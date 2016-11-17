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
    vm.googleServiceAccount = googleServiceAccount;


    vm.clearFile = function () {
      vm.file = undefined;
      vm.fileName = undefined;
    };

    vm.uploadCertificate = function () {
      vm.loading = true;
      CloudConnectorService.updateConfig(vm.googleServiceAccount, vm.file, 'squared-fusion-gcal')
        .then(function () {
          Notification.success($translate.instant('hercules.settings.googleCalendar.successfullyUploadedKey', {
            filename: vm.fileName
          }));
          $modalInstance.close(vm.googleServiceAccount);
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.failedToUploadKey');
          vm.loading = false;
        });
    };

  }

}());
