(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrlRedux', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($scope, $q, XhrNotificationService, $stateParams, Authinfo, FeedbackService, CsdmCodeService, CsdmDeviceService, Utils, $window) {
    var vm = this;
    vm.currentDevice = $stateParams.currentDevice;

    $scope.save = function (newName) {
      if (vm.currentDevice.needsActivation) {
        return CsdmCodeService
          .updateCodeName(vm.currentDevice.url, newName)
          .catch(XhrNotificationService.notify);
      } else {
        return CsdmDeviceService
          .updateDeviceName(vm.currentDevice.url, newName)
          .catch(XhrNotificationService.notify);
      }
    };

    $scope.reportProblem = function () {
      var feedbackId = Utils.getUUID();

      return CsdmDeviceService.uploadLogs(vm.currentDevice.url, feedbackId, Authinfo.getPrimaryEmail())
        .then(function () {
          var appType = 'Atlas_' + $window.navigator.userAgent;
          return FeedbackService.getFeedbackUrl(appType, feedbackId);
        })
        .then(function (res) {
          $window.open(res.data.url, '_blank');
        })
        .catch(XhrNotificationService.notify);
    };

  }
})();
