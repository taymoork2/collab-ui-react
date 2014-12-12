(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('DevicesCtrl', DevicesCtrl);

  DevicesCtrl.$inject = ['$scope', '$state', 'DeviceService', 'Config'];

  function DevicesCtrl($scope, $state, DeviceService, Config) {
    var vm = this;
    vm.devices = [];
    vm.showDeviceDetailPanel = showDeviceDetailPanel;

    ////////////

    function activate() {
      return DeviceService.loadDevices($scope.currentUser.id).then(function (deviceList) {
        vm.devices = deviceList;
        return vm.devices;
      });
    }

    function showDeviceDetailPanel(device) {
      DeviceService.setCurrentDevice(device);
      $state.go('users.list.preview.device');
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
        if (isHuronEnabled()) {
          activate();
        }
      }
    });

    $scope.$on('updateDeviceList', function () {
      activate();
    });

    $scope.$on('entitlementsUpdated', function () {
      if (isHuronEnabled()) {
        activate();
      }
    });

  }
})();
