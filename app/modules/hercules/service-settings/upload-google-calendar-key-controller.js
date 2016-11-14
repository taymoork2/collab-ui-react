(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('UploadGoogleCalendarKeyController', UploadGoogleCalendarKeyController);

  /* @ngInject */
  function UploadGoogleCalendarKeyController($modalInstance, CloudConnectorService, Notification, googleServiceAccount) {
    var vm = this;
    vm.googleServiceAccount = googleServiceAccount;
    var privateKey = 'MIIEpQIBAAKCAQEA3Tz2mr7SZiAMfQyuvBjM9Oi..Z1BjP5CE/Wm/Rr500P'; // obviously a dummy key

    vm.uploadCertificate = function () {
      vm.loading = true;
      CloudConnectorService.updateConfig(googleServiceAccount, privateKey, 'squared-fusion-gcal')
        .then(function () {
          Notification.success('hercules.settings.googleCalendar.successfullyUploadedKey');
          $modalInstance.close();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
          vm.loading = false;
        });
    };

  }

}());
