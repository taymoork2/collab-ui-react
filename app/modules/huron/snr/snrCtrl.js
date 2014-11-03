'use strict';

angular.module('Huron')
  .controller('SingleNumberReachInfoCtrl', ['$scope', '$q', 'RemoteDestinationService', 'TelephonyInfoService', 'Log', 'Config', 'Notification', '$filter',
    function ($scope, $q, RemoteDestinationService, TelephonyInfoService, Log, Config, Notification, $filter) {

      $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
      $scope.snrOptions = [{
        label: 'All Lines',
        line: 'all'
      }, {
        label: 'Only certain lines',
        line: 'specific'
      }];
      $scope.snrLineOption = $scope.snrOptions[0];

      $scope.$on('telephonyInfoUpdated', function () {
        $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
      });

      $scope.createRemoteDestinationInfo = function (user, destination) {
        var deferred = $q.defer();
        var rdBean = {
          'destination': destination,
          'name': 'RD-' + getRandomString(),
          'autoAssignRemoteDestinationProfile': true
        };
        var result = {
          msg: null,
          type: 'null'
        };

        RemoteDestinationService.save({
            customerId: user.meta.organizationID,
            userId: user.id
          }, rdBean,
          function (data) {
            deferred.resolve(data);

            result.msg = $filter('translate')('singleNumberReachPanel.success');
            result.type = 'success';
            Notification.notify([result.msg], result.type);
          },
          function (error) {
            Log.debug('updateRemoteDestinationInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
            result.msg = $filter('translate')('singleNumberReachPanel.error') + error.data;
            result.type = 'error';
            Notification.notify([result.msg], result.type);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.processCreateRemoteDestionInfo = function (response) {
        if (response !== null && response !== undefined) {
          $scope.telephonyInfo.singleNumberReach = 'On';
        }
        angular.element('#btnSaveSingleNumberReach').button('reset');
      };

      $scope.deleteRemoteDestinationInfo = function (user) {
        var deferred = $q.defer();
        var result = {
          msg: null,
          type: 'null'
        };
        RemoteDestinationService.delete({
            customerId: user.meta.organizationID,
            userId: user.id,
            remoteDestId: $scope.telephonyInfo.snrInfo.remoteDestinations[0].uuid
          },
          function (data) {
            deferred.resolve(data);
            $scope.telephonyInfo.snrInfo.destination = null;
            $scope.telephonyInfo.snrInfo.remoteDestinations = null;
            TelephonyInfoService.updateSnr($scope.telephonyInfo.snrInfo);

            result.msg = $filter('translate')('singleNumberReachPanel.removeSuccess');
            result.type = 'success';
            Notification.notify([result.msg], result.type);
            angular.element('#btnSaveSingleNumberReach').button('reset');
          },
          function (error) {
            Log.debug('deleteRemoteDestinationInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
            result.msg = $filter('translate')('singleNumberReachPanel.error') + error.data;
            result.type = 'error';
            Notification.notify([result.msg], result.type);
            angular.element('#btnSaveSingleNumberReach').button('reset');
            deferred.reject(error);
          });
      };

      $scope.updateRemoteDestinationInfo = function (user, destination) {
        var deferred = $q.defer();
        var rdBean = {
          'destination': destination
        };
        var result = {
          msg: null,
          type: 'null'
        };

        RemoteDestinationService.update({
            customerId: user.meta.organizationID,
            userId: user.id,
            remoteDestId: $scope.telephonyInfo.snrInfo.remoteDestinations[0].uuid
          }, rdBean,
          function (data) {
            deferred.resolve(data);
            result.msg = $filter('translate')('singleNumberReachPanel.success');
            result.type = 'success';
            Notification.notify([result.msg], result.type);
            angular.element('#btnSaveSingleNumberReach').button('reset');
          },
          function (error) {
            Log.debug('updateRemoteDestinationInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
            result.msg = $filter('translate')('singleNumberReachPanel.error') + error.data;
            result.type = 'error';
            Notification.notify([result.msg], result.type);
            deferred.reject(error);
            angular.element('#btnSaveSingleNumberReach').button('reset');
          });
        return deferred.promise;
      };

      $scope.saveSingleNumberReach = function () {
        angular.element('#btnSaveSingleNumberReach').button('loading');
        if ($scope.telephonyInfo.snrInfo.remoteDestinations !== null && $scope.telephonyInfo.snrInfo.remoteDestinations !== undefined && $scope.telephonyInfo.snrInfo.remoteDestinations.length > 0) {
          if (!$scope.telephonyInfo.snrInfo.singleNumberReachEnabled) {
            $scope.deleteRemoteDestinationInfo($scope.currentUser);
          } else {
            $scope.updateRemoteDestinationInfo($scope.currentUser, $scope.telephonyInfo.snrInfo.destination);
          }
        } else {
          $scope.createRemoteDestinationInfo($scope.currentUser, $scope.telephonyInfo.snrInfo.destination, $scope.singleNumberReach)
            .then(function (response) {
              $scope.processCreateRemoteDestionInfo(response);
            })
            .then(function (response) {
              TelephonyInfoService.getRemoteDestinationInfo($scope.currentUser)
                .then(function (response) {
                  TelephonyInfoService.processRemoteDestinationInfo(response);
                })
                .catch(function (response) {
                  TelephonyInfoService.processRemoteDestinationInfo(null);
                });
            })
            .catch(function (response) {
              $scope.processCreateRemoteDestionInfo(null);
            });
        }
      };

      var getRandomString = function () {
        var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var randomString = '';
        for (var i = 0; i < 12; i++) {
          var randIndex = Math.floor(Math.random() * charSet.length);
          randomString += charSet.substring(randIndex, randIndex + 1);
        }
        return randomString;
      };

    }
  ]);
