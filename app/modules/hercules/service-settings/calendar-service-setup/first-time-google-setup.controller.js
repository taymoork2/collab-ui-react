(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FirstTimeGoogleSetupController', FirstTimeGoogleSetupController);

  /* @ngInject */
  function FirstTimeGoogleSetupController($modalInstance, CloudConnectorService, Notification) {
    var vm = this;

    vm.step = 'documentation'; // | 'upload-private-key' | 'final'

    vm.data = {
      googleServiceAccount: '',
      fileName: '',
      file: '',
    };

    vm.haveReadDocumentation = function () {
      vm.step = 'upload-private-key';
    };

    vm.uploadKey = function () {
      vm.loading = true;
      CloudConnectorService.updateConfig(vm.data.googleServiceAccount, vm.data.file, 'squared-fusion-gcal')
        .then(function () {
          vm.step = 'final';
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.failedToActivateService');
          vm.loading = false;
        });
    };

    vm.navigateToUsers = function () {
      $modalInstance.close('users.list');
    };

    vm.navigateToCSV = function () {
      // where exactly are we supposed to link to?
      $modalInstance.close('users.list');
    };

    vm.closeModal = function () {
      $modalInstance.close('calendar-service.settings');
    };

  }

}());
