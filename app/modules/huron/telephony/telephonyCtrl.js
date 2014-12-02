(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('TelephonyInfoCtrl', TelephonyInfoCtrl);

  TelephonyInfoCtrl.$inject = ['$scope', '$state', 'TelephonyInfoService', 'Config'];

  function TelephonyInfoCtrl($scope, $state, TelephonyInfoService, Config) {
    var vm = this;
    vm.showDirectoryNumberPanel = showDirectoryNumberPanel;
    vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();

    function showDirectoryNumberPanel(directoryNumber) {
      if (directoryNumber === 'new') {
        TelephonyInfoService.updateCurrentDirectoryNumber('new');
        $state.go('users.list.preview.adddirectorynumber');
      } else {
        // update alternate number first
        TelephonyInfoService.updateAlternateDirectoryNumber(directoryNumber.altDnUuid, directoryNumber.altDnPattern);
        TelephonyInfoService.updateCurrentDirectoryNumber(directoryNumber.uuid, directoryNumber.pattern, directoryNumber.dnUsage);
      }
      $state.go('users.list.preview.directorynumber');
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

    $scope.$on('telephonyInfoUpdated', function () {
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
    });

    $scope.$watch('currentUser', function (newUser, oldUser) {
      if (newUser) {
        TelephonyInfoService.resetTelephonyInfo();
        if (isHuronEnabled()) {
          TelephonyInfoService.getTelephonyUserInfo(newUser.id);
          TelephonyInfoService.getUserDnInfo(newUser.id);
          TelephonyInfoService.getRemoteDestinationInfo(newUser.id);
          TelephonyInfoService.loadInternalNumberPool();
          TelephonyInfoService.loadExternalNumberPool();
        }
      }
    });
  }
})();
