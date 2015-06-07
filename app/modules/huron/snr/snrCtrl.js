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
    vm.snrInfo = angular.copy(TelephonyInfoService.getTelephonyInfo().snrInfo);

    vm.formFields = [{
      key: 'destination',
      type: 'input',
      templateOptions: {
        type: 'text',
        placeholder: $translate.instant('singleNumberReachPanel.placeholder'),
        inputClass: 'col-sm-12',
        maxlength: 24,
        required: true
      },
      expressionProperties: {
        'hide': '!model.singleNumberReachEnabled'
      }
    }];

    vm.snrOptions = [{
      label: 'All Lines',
      line: 'all'
    }, {
      label: 'Only certain lines',
      line: 'specific'
    }];
    vm.snrLineOption = vm.snrOptions[0];

    $scope.$on('telephonyInfoUpdated', function () {
      init();
    });

    function init() {
      var snrInfo = TelephonyInfoService.getTelephonyInfo().snrInfo;
      vm.snrInfo.singleNumberReachEnabled = snrInfo.singleNumberReachEnabled;
      vm.snrInfo.destination = snrInfo.destination;
      vm.snrInfo.remoteDestinations = snrInfo.remoteDestinations;
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
          TelephonyInfoService.updateSnr(vm.snrInfo);

          result.msg = $translate.instant('singleNumberReachPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },
        function (response) {
          Notification.errorResponse(response, 'singleNumberReachPanel.error');
        }).$promise;
    }

    function deleteRemoteDestinationInfo(user) {
      var result = {
        msg: null,
        type: 'null'
      };

      return RemoteDestinationService.delete({
          customerId: user.meta.organizationID,
          userId: user.id,
          remoteDestId: vm.snrInfo.remoteDestinations[0].uuid
        },
        function () {
          vm.snrInfo.destination = null;
          vm.snrInfo.remoteDestinations = null;
          vm.snrInfo.singleNumberReachEnabled = false;
          TelephonyInfoService.updateSnr(vm.snrInfo);

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
          remoteDestId: vm.snrInfo.remoteDestinations[0].uuid
        }, rdBean,
        function () {
          TelephonyInfoService.updateSnr(vm.snrInfo);

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
        if (angular.isArray(vm.snrInfo.remoteDestinations) && vm.snrInfo.remoteDestinations.length > 0) {
          if (!vm.snrInfo.singleNumberReachEnabled) {
            deleteRemoteDestinationInfo(vm.currentUser).then(function () {
              resetForm();
            });
          } else {
            updateRemoteDestinationInfo(vm.currentUser, vm.snrInfo.destination).then(function () {
              resetForm();
            });
          }
        } else if (vm.snrInfo.singleNumberReachEnabled) {
          createRemoteDestinationInfo(vm.currentUser, vm.snrInfo.destination)
            .then(function (response) {
              TelephonyInfoService.getRemoteDestinationInfo(vm.currentUser.id);
              resetForm();
            });
        } else {
          // Nothing to delete, notify success
          resetForm();
          Notification.notify([$translate.instant('singleNumberReachPanel.removeSuccess')], 'success');
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
