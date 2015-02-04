(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrl', DevicesCtrl);

  /* @ngInject */
  function DevicesCtrl($scope, $q, DeviceService, OtpService, Config) {
    var vm = this;
    vm.devices = [];
    vm.otps = [];
    vm.showGenerateOtpButton = false;
    vm.showDeviceDetailPanel = showDeviceDetailPanel;

    ////////////

    function activate() {
      var promises = [];

      // reset to false when loaded
      vm.showGenerateOtpButton = false;

      var devicePromise = DeviceService.loadDevices($scope.currentUser.id).then(function (deviceList) {
        vm.devices = deviceList;
      });
      promises.push(devicePromise);

      var otpPromise = OtpService.loadOtps($scope.currentUser.id).then(function (otpList) {
        vm.otps = otpList;
      });
      promises.push(otpPromise);

      return $q.all(promises)
        .then(function () {
          if (vm.devices.length === 0 && vm.otps.length === 0) {
            vm.showGenerateOtpButton = true;
          }

          if (vm.devices.length > 0 && vm.otps.length === 0) {
            $scope.$parent.userDevicesCard.addGenerateAuthCodeLink();
          } else {
            $scope.$parent.userDevicesCard.removeGenerateAuthCodeLink();
          }
        });
    }

    function showDeviceDetailPanel(device) {
      DeviceService.setCurrentDevice(device);
    }

    function isHuronEnabled() {
      return isEntitled(Config.entitlements.huron);
    }

    function isEntitled(ent) {
      if ($scope.currentUser && $scope.currentUser.entitlements) {
        for (var i = 0; i < $scope.currentUser.entitlements.length; i++) {
          var svc = $scope.currentUser.entitlements[i];
          if (svc === ent) {
            return true;
          }
        }
      }
      return false;
    }

    $scope.$watch('currentUser', function (newUser, oldUser) {
      if (newUser) {
        vm.showGenerateOtpButton = false;
        if (isHuronEnabled()) {
          activate();
        }
      }
    });

    $scope.$on('deviceDeactivated', function () {
      if (isHuronEnabled()) {
        activate();
      }
    });

    $scope.$on('otpGenerated', function () {
      if (isHuronEnabled()) {
        activate();
      }
    });

    $scope.$on('entitlementsUpdated', function () {
      if (isHuronEnabled()) {
        activate();
      }
    });

  }
})();
