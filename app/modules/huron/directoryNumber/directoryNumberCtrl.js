'use strict';

angular.module('Huron')
  .controller('DirectoryNumberInfoCtrl', ['$scope', '$q', 'UserDirectoryNumberService', 'UnassignedDirectoryNumberService', 'UserDirectoryNumberDetailService', 'TelephonyInfoService', 'Log', 'Config', 'Notification', '$filter',
    function ($scope, $q, UserDirectoryNumberService, UnassignedDirectoryNumberService, UserDirectoryNumberDetailService, TelephonyInfoService, Log, Config, Notification, $filter) {
      $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();

      $scope.$on('telephonyInfoUpdated', function () {
        $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
        getDnDetails();
      });

      $scope.unassingedDirectoryNumbers = [];
      $scope.assignedInternalNumber = null;
      $scope.directoryNumberDetail = null;

      $scope.getDirectoryNumberDetails = function (user) {
        var deferred = $q.defer();
        UserDirectoryNumberDetailService.get({
            customerId: user.meta.organizationID,
            directoryNumberId: $scope.telephonyInfo.currentDirectoryNumber.uuid
          },
          function (data) {
            deferred.resolve(data);
          },
          function (error) {
            Log.debug('getDirectoryNumberDetails failed.  Status: ' + error.status + ' Response: ' + error.data);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.processDirectoryNumberDetails = function (dn) {
        $scope.directoryNumberDetail = dn;
        $scope.assignedInternalNumber = {
          'pattern': dn.pattern.substr(1),
          'id': dn.uuid
        };
      };

      $scope.getUnassignedDirectoryNumbers = function (user) {
        var deferred = $q.defer();
        UnassignedDirectoryNumberService.get({
            customerId: user.meta.organizationID
          },
          function (data) {
            deferred.resolve(data);
          },
          function (error) {
            Log.debug('getUnassignedDirectoryNumbers failed.  Status: ' + error.status + ' Response: ' + error.data);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.processUnassignedDirectoryNumbers = function (unassignedNumbers) {
        var unassignedNumber = null;
        for (var i = 0; i < unassignedNumbers.length; i++) {
          unassignedNumber = {
            'pattern': unassignedNumbers[i].pattern.substr(1),
            'id': unassignedNumbers[i].uuid
          };
          $scope.unassingedDirectoryNumbers.push(unassignedNumber);
        }
        unassignedNumber = {
          'pattern': $scope.telephonyInfo.currentDirectoryNumber.pattern.substr(1),
          'id': $scope.telephonyInfo.currentDirectoryNumber.uuid
        };
        $scope.unassingedDirectoryNumbers.push(unassignedNumber);
      };

      $scope.removeDirectoryNumberAssociation = function (user) {
        var deferred = $q.defer();
        UserDirectoryNumberService.delete({
            customerId: user.meta.organizationID,
            userId: user.id,
            directoryNumberId: $scope.telephonyInfo.currentDirectoryNumber.uuid
          },
          function (data) {
            deferred.resolve(data);
          },
          function (error) {
            Log.debug('removeDirectoryNumberAssociation failed.  Status: ' + error.status + ' Response: ' + error.data);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.addDirectoryNumberAssociation = function (user) {
        var deferred = $q.defer();
        var userLine = {
          'dnUsage': $scope.telephonyInfo.currentDirectoryNumber.dnUsage,
          'directoryNumber': {
            'uuid': user.dn.uuid
          }
        };
        var result = {
          msg: null,
          type: 'null'
        };

        UserDirectoryNumberService.save({
            customerId: user.meta.organizationID,
            userId: user.id
          }, userLine,
          function (data) {
            deferred.resolve(data);
            result.msg = $filter('translate')('directoryNumberPanel.removeSuccess');
            result.type = 'success';
            Notification.notify([result.msg], result.type);
          },
          function (error) {
            Log.debug('addDirectoryNumberAssociation failed.  Status: ' + error.status + ' Response: ' + error.data);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.saveDirectoryNumber = function () {
        $scope.$emit('saveLineSettings');
      };

      var getDnDetails = function () {
        $scope.getDirectoryNumberDetails($scope.currentUser)
          .then(function (response) {
            $scope.processDirectoryNumberDetails(response);
          })
          .catch(function (response) {
            $scope.processDirectoryNumberDetails(null);
          });
      }

      var getUnassignedDns = function () {
        $scope.getUnassignedDirectoryNumbers($scope.currentUser)
          .then(function (response) {
            $scope.processUnassignedDirectoryNumbers(response);
          })
          .catch(function (response) {
            $scope.processUnassignedDirectoryNumbers(null);
          });
      }

      // Called when controller loads.
      getDnDetails();
      getUnassignedDns();

    }
  ]);
