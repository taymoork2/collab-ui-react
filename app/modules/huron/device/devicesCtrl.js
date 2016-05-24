(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DevicesCtrlHuron', DevicesCtrlHuron);

  /* @ngInject */
  function DevicesCtrlHuron($scope, $state, $stateParams, OtpService, Config, CsdmHuronUserDeviceService) {
    var vm = this;
    vm.devices = {};
    vm.otps = [];
    vm.currentUser = $stateParams.currentUser;
    vm.csdmHuronUserDeviceService = null;
    vm.showGenerateOtpButton = false;

    function addLinkOrButtonForActivationCode() {
      if (vm.csdmHuronUserDeviceService.dataLoaded()) {
        if (_.size(vm.devices)) {
          $scope.userOverview.enableAuthCodeLink();
          vm.showGenerateOtpButton = false;
        } else {
          $scope.userOverview.disableAuthCodeLink();
          vm.showGenerateOtpButton = true;
        }
      }
    }

    vm.showDeviceDetails = function (device) {
      $state.go('user-overview.csdmDevice', {
        currentDevice: device,
        huronDeviceService: vm.csdmHuronUserDeviceService
      });
    };

    function activate() {

      vm.csdmHuronUserDeviceService = CsdmHuronUserDeviceService.create(vm.currentUser.id);
      vm.devices = vm.csdmHuronUserDeviceService.getDeviceList();
      $scope.$watchCollection(function () {
        return vm.devices;
      }, addLinkOrButtonForActivationCode);
      OtpService.loadOtps(vm.currentUser.id).then(function (otpList) {
        vm.otps = otpList;
      });
    }

    function isHuronEnabled() {
      return isEntitled(Config.entitlements.huron);
    }

    function isEntitled(ent) {
      vm.currentUser = $stateParams.currentUser;
      if (vm.currentUser && vm.currentUser.entitlements) {
        for (var i = 0; i < vm.currentUser.entitlements.length; i++) {
          var svc = vm.currentUser.entitlements[i];
          if (svc === ent) {
            return true;
          }
        }
      }
      return false;
    }

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

    if (isHuronEnabled()) {
      activate();
    }

  }
})();
