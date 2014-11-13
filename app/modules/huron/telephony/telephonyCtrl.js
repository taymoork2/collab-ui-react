'use strict';

angular.module('Huron')
  .controller('TelephonyInfoCtrl', ['$scope', '$q', '$state', 'UserDirectoryNumberService', 'UserServiceCommon', 'RemoteDestinationService', 'TelephonyInfoService', 'Log', 'Config', 'Notification',
    function ($scope, $q, $state, UserDirectoryNumberService, UserServiceCommon, RemoteDestinationService, TelephonyInfoService, Log, Config, Notification) {

      $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();

      $scope.$on('telephonyInfoUpdated', function () {
        $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
      });

      $scope.$watch('currentUser', function (newUser, oldUser) {
        if (newUser) {
          TelephonyInfoService.resetTelephonyInfo();
          if ($scope.isHuronEnabled()) {
            TelephonyInfoService.getTelephonyUserInfo(newUser.id);
            TelephonyInfoService.getUserDnInfo(newUser.id);
            TelephonyInfoService.getRemoteDestinationInfo(newUser.id);
            TelephonyInfoService.updateInternalNumberPool();
            TelephonyInfoService.updateExternalNumberPool();
          }
        }
      });

      $scope.showDirectoryNumberPanel = function (directoryNumber) {
        if (directoryNumber === 'new') {
          TelephonyInfoService.updateCurrentDirectoryNumber('new');
          $state.go('users.list.preview.adddirectorynumber');
        } else {
          // update alternate number first
          TelephonyInfoService.updateAlternateDirectoryNumber(directoryNumber.altDnUuid, directoryNumber.altDnPattern);
          TelephonyInfoService.updateCurrentDirectoryNumber(directoryNumber.uuid, directoryNumber.pattern, directoryNumber.dnUsage);
        }
        $state.go('users.list.preview.directorynumber');
      };

      $scope.isHuronEnabled = function () {
        return isEntitled(Config.entitlements.huron);
      };

      var isEntitled = function (ent) {
        if ($scope.currentUser && $scope.currentUser.entitlements) {
          for (var i = 0; i < $scope.currentUser.entitlements.length; i++) {
            var svc = $scope.currentUser.entitlements[i];

            if (svc === ent) {
              return true;
            }
          }
        }
        return false;
      };

    }
  ]);
