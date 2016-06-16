(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('TelephonyInfoCtrl', TelephonyInfoCtrl);

  /* @ngInject */
  function TelephonyInfoCtrl($scope, TelephonyInfoService, Config) {
    var vm = this;
    vm.showDirectoryNumberPanel = showDirectoryNumberPanel;
    vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();

    function showDirectoryNumberPanel(directoryNumber) {
      if (directoryNumber === 'new') {
        TelephonyInfoService.updateCurrentDirectoryNumber('new');
      } else {
        // update alternate number first
        TelephonyInfoService.updateAlternateDirectoryNumber(directoryNumber.altDnUuid, directoryNumber.altDnPattern);
        TelephonyInfoService.updateCurrentDirectoryNumber(directoryNumber.uuid, directoryNumber.pattern, directoryNumber.dnUsage, directoryNumber.userDnUuid);
      }
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

    function updateTelephonyInfo(user) {
      TelephonyInfoService.resetTelephonyInfo();
      if (isHuronEnabled()) {
        TelephonyInfoService.getTelephonyUserInfo(user.id);
        TelephonyInfoService.getUserDnInfo(user.id);
        TelephonyInfoService.getRemoteDestinationInfo(user.id);
        TelephonyInfoService.loadInternalNumberPool();
        TelephonyInfoService.loadExternalNumberPool();
      }
    }

    $scope.$on('telephonyInfoUpdated', function () {
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
    });

    $scope.$on('entitlementsUpdated', function () {
      updateTelephonyInfo($scope.currentUser);
    });

    $scope.$watch('currentUser', function (newUser) {
      if (newUser) {
        updateTelephonyInfo(newUser);
      }
    });
  }
})();
