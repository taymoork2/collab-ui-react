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
          .then(undefined, XhrNotificationService.notify);
      } else {
        return CsdmDeviceService
          .updateDeviceName(vm.currentDevice.url, newName)
          .then(undefined, XhrNotificationService.notify);
      }
    };

    $scope.reportProblem = function () {
      var deferred = $q.defer();
      var feedbackId = Utils.getUUID();

      function success() {
        var appType = 'Atlas_' + $window.navigator.userAgent;
        FeedbackService.getFeedbackUrl(appType, feedbackId, function (data, status) {
          deferred.resolve();
          if (data.success) $window.open(data.url, '_blank');
        });
      }

      function error(err) {
        XhrNotificationService.notify(err);
        deferred.reject();
      }

      CsdmDeviceService
        .uploadLogs(vm.currentDevice.url, feedbackId, Authinfo.getPrimaryEmail())
        .then(success, error);

      return deferred.promise;
    };

  }
})();
