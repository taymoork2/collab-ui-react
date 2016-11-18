(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FirstTimeGoogleSetupController', FirstTimeGoogleSetupController);

  /* @ngInject */
  function FirstTimeGoogleSetupController($modalInstance, CloudConnectorService, Notification) {
    var vm = this;

    vm.inDocumentationStep = true;
    vm.inUploadPrivateKeyStep = false;
    vm.inFinalStep = false;

    vm.data = {
      googleServiceAccount: '',
      fileName: '',
      file: '',
    };

    vm.cancel = function () {
      $modalInstance.dismiss();
    };

    vm.haveReadDocumentation = function () {
      vm.inDocumentationStep = false;
      vm.inUploadPrivateKeyStep = true;
    };

    vm.uploadKey = function () {
      vm.loading = true;
      CloudConnectorService.updateConfig(vm.data.googleServiceAccount, vm.data.file, 'squared-fusion-gcal')
        .then(function () {
          vm.inUploadPrivateKeyStep = false;
          vm.inFinalStep = true;
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.failedToUploadKey');
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
