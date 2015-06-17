(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrlRedux', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($scope, XhrNotificationService, $stateParams, $translate, Authinfo, FeedbackService, CsdmService, Utils, $window, Notification) {
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

    $scope.sendFeedback = function (device) {
      var feedbackId = Utils.getUUID();
      CsdmService.uploadLogs(device.url, feedbackId, Authinfo.getPrimaryEmail(), function (err, data) {
        if (err) {
          return XhrNotificationService.notify(err);
        } else {
          var appType = 'Atlas_' + $window.navigator.userAgent;
          FeedbackService.getFeedbackUrl(appType, feedbackId, function (data, status) {
            if (data.success) {
              $window.open(data.url, '_blank');
            }
          });
          return Notification.notify("Logs uploaded for device " + device.displayName + " feedbackId: " + feedbackId, "success");
        }
      });
    };
  }
})();
