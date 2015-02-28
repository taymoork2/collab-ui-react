(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('SingleNumberReachInfoCtrl', SingleNumberReachInfoCtrl);

  function SingleNumberReachInfoCtrl($scope, RemoteDestinationService, TelephonyInfoService, Notification, $translate, HttpUtils) {
    var vm = this;
    vm.saveSingleNumberReach = saveSingleNumberReach;
    vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
    vm.snrOptions = [{
      label: 'All Lines',
      line: 'all'
    }, {
      label: 'Only certain lines',
      line: 'specific'
    }];
    vm.snrLineOption = vm.snrOptions[0];

    $scope.$on('telephonyInfoUpdated', function () {
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
    });

    function createRemoteDestinationInfo(user, destination) {
      var rdBean = {
        'destination': destination,
        'name': 'RD-' + getRandomString(),
        'autoAssignRemoteDestinationProfile': true
      };
      var result = {
        msg: null,
        type: 'null'
      };

      return RemoteDestinationService.save({
          customerId: user.meta.organizationID,
          userId: user.id
        }, rdBean,
        function (data) {
          result.msg = $translate.instant('singleNumberReachPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          result.msg = $translate.instant('singleNumberReachPanel.error') + response.data.errorMessage;
          result.type = 'error';
          Notification.notify([result.msg], result.type);
        }).$promise;
    }

    function processCreateRemoteDestionInfo(response) {
      if (response !== null && response !== undefined) {
        vm.telephonyInfo.singleNumberReach = 'On';
      }
    }

    function deleteRemoteDestinationInfo(user) {
      var result = {
        msg: null,
        type: 'null'
      };
      RemoteDestinationService.delete({
          customerId: user.meta.organizationID,
          userId: user.id,
          remoteDestId: vm.telephonyInfo.snrInfo.remoteDestinations[0].uuid
        },
        function (data) {
          vm.telephonyInfo.snrInfo.destination = null;
          vm.telephonyInfo.snrInfo.remoteDestinations = null;
          TelephonyInfoService.updateSnr(vm.telephonyInfo.snrInfo);

          result.msg = $translate.instant('singleNumberReachPanel.removeSuccess');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          result.msg = $translate.instant('singleNumberReachPanel.error') + response.data.errorMessage;
          result.type = 'error';
          Notification.notify([result.msg], result.type);
        });
    }

    function updateRemoteDestinationInfo(user, destination) {
      var rdBean = {
        'destination': destination
      };
      var result = {
        msg: null,
        type: 'null'
      };

      return RemoteDestinationService.update({
          customerId: user.meta.organizationID,
          userId: user.id,
          remoteDestId: vm.telephonyInfo.snrInfo.remoteDestinations[0].uuid
        }, rdBean,
        function (data) {
          result.msg = $translate.instant('singleNumberReachPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          result.msg = $translate.instant('singleNumberReachPanel.error') + response.data.errorMessage;
          result.type = 'error';
          Notification.notify([result.msg], result.type);
        }).$promise;
    }

    function saveSingleNumberReach() {
      HttpUtils.setTrackingID().then(function () {
        if (vm.telephonyInfo.snrInfo.remoteDestinations !== null && vm.telephonyInfo.snrInfo.remoteDestinations !== undefined && vm.telephonyInfo.snrInfo.remoteDestinations.length > 0) {
          if (!vm.telephonyInfo.snrInfo.singleNumberReachEnabled) {
            deleteRemoteDestinationInfo($scope.currentUser);
          } else {
            updateRemoteDestinationInfo($scope.currentUser, vm.telephonyInfo.snrInfo.destination);
          }
        } else {
          createRemoteDestinationInfo($scope.currentUser, vm.telephonyInfo.snrInfo.destination, $scope.singleNumberReach)
            .then(function (response) {
              processCreateRemoteDestionInfo(response);
            })
            .then(function (response) {
              TelephonyInfoService.getRemoteDestinationInfo($scope.currentUser.id);
            })
            .catch(function (response) {
              processCreateRemoteDestionInfo(null);
            });
        }
      });
    }

    function getRandomString() {
      var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      var randomString = '';
      for (var i = 0; i < 12; i++) {
        var randIndex = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randIndex, randIndex + 1);
      }
      return randomString;
    }
  }
})();
