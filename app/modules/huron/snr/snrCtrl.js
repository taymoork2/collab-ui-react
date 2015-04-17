(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('SingleNumberReachInfoCtrl', SingleNumberReachInfoCtrl);

  function SingleNumberReachInfoCtrl($scope, $stateParams, RemoteDestinationService, TelephonyInfoService, Notification, $translate, HttpUtils) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.saveSingleNumberReach = saveSingleNumberReach;
    vm.reset = reset;

    vm.snrOptions = [{
      label: 'All Lines',
      line: 'all'
    }, {
      label: 'Only certain lines',
      line: 'specific'
    }];
    vm.snrLineOption = vm.snrOptions[0];

    init();

    $scope.$on('telephonyInfoUpdated', function () {
      init();
    });

    function init() {
      vm.telephonyInfo = angular.copy(TelephonyInfoService.getTelephonyInfo());
    }

    function resetForm() {
      if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function reset(form) {
      resetForm();
      init();
    }

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
        function () {
          result.msg = $translate.instant('singleNumberReachPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          Notification.errorResponse(response, 'singleNumberReachPanel.error');
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

      return RemoteDestinationService.delete({
          customerId: user.meta.organizationID,
          userId: user.id,
          remoteDestId: vm.telephonyInfo.snrInfo.remoteDestinations[0].uuid
        },
        function () {
          vm.telephonyInfo.snrInfo.destination = null;
          vm.telephonyInfo.snrInfo.remoteDestinations = null;
          TelephonyInfoService.updateSnr(vm.telephonyInfo.snrInfo);

          result.msg = $translate.instant('singleNumberReachPanel.removeSuccess');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          Notification.errorResponse(response, 'singleNumberReachPanel.error');
        }).$promise;
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
        function () {
          TelephonyInfoService.updateSnr(vm.telephonyInfo.snrInfo);

          result.msg = $translate.instant('singleNumberReachPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          Notification.errorResponse(response, 'singleNumberReachPanel.error');
        }).$promise;
    }

    function saveSingleNumberReach() {
      HttpUtils.setTrackingID().then(function () {
        if (vm.telephonyInfo.snrInfo.remoteDestinations !== null && vm.telephonyInfo.snrInfo.remoteDestinations !== undefined && vm.telephonyInfo.snrInfo.remoteDestinations.length > 0) {
          if (!vm.telephonyInfo.snrInfo.singleNumberReachEnabled) {
            deleteRemoteDestinationInfo(vm.currentUser).then(function () {
              resetForm();
            });
          } else {
            updateRemoteDestinationInfo(vm.currentUser, vm.telephonyInfo.snrInfo.destination).then(function () {
              resetForm();
            });
          }
        } else {
          createRemoteDestinationInfo(vm.currentUser, vm.telephonyInfo.snrInfo.destination)
            .then(function (response) {
              processCreateRemoteDestionInfo(response);
              TelephonyInfoService.getRemoteDestinationInfo(vm.currentUser.id);
              resetForm();
            })
            .catch(function () {
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
