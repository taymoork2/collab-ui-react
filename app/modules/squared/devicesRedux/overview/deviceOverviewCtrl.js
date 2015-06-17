(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrlRedux', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($scope, XhrNotificationService, $stateParams, $translate, Authinfo, CsdmService, Log, Notification) {
    var vm = this;
    vm.currentDevice = $stateParams.currentDevice;
    $scope.editorEnabled = false;

    $scope.enableEditor = function () {
      $scope.editorEnabled = true;
    };

    $scope.disableEditor = function () {
      $scope.editorEnabled = false;
    };

    $scope.save = function () {
      CsdmService.updateDeviceName(vm.currentDevice.url, vm.currentDevice.displayName, function (err, data) {
        if (err) return XhrNotificationService.notify(err);
      });
      $scope.disableEditor();
    };

    $scope.uploadLogs = function (device) {
      CsdmService.uploadLogs(device.url, function (err, data) {
        if (err) {
          return XhrNotificationService.notify(err);
        } else {
          return Notification.notify("Logs uploaded for device " + device.displayName, "success");
        }
      });
    };
  }
})();
