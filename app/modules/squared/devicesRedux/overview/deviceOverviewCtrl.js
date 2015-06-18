(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrlRedux', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($scope, XhrNotificationService, $stateParams, Authinfo, FeedbackService, CsdmService, Utils, $window) {
    var vm = this;
    vm.currentDevice = $stateParams.currentDevice;

    $scope.save = function (success, error) {
      CsdmService.updateDeviceName(vm.currentDevice.url, vm.currentDevice.displayName, function (err, data) {
        if (err) {
          XhrNotificationService.notify(err);
          error();
        } else {
          success();
        }
      });
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
        }
      });
    };

  }
})();
