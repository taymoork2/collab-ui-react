'use strict';

angular.module('Huron')
  .controller('DirectoryNumberInfoCtrl', ['$scope', '$q', '$http', 'UserDirectoryNumberService', 'UnassignedDirectoryNumberService', 'UserDirectoryNumberDetailService', 'Log', 'Config', 'Notification', '$filter',
    function ($scope, $q, $http, UserDirectoryNumberService, UnassignedDirectoryNumberService, UserDirectoryNumberDetailService, Log, Config, Notification, $filter) {
      $scope.unassingedDirectoryNumbers = [];
      $scope.assignedInternalNumber = null;
      $scope.directoryNumberDetail = null;

      $scope.getDirectoryNumberDetails = function (user) {
        var deferred = $q.defer();
        // TODO: Remove the following line when we are authenticating with CMI
        delete $http.defaults.headers.common.Authorization;
        UserDirectoryNumberDetailService.get({customerId: user.meta.organizationID, directoryNumberId: $scope.directoryNumber.uuid},
        function (data) {
            deferred.resolve(data);
          }, function (error) {
            Log.debug('getDirectoryNumberDetails failed.  Status: ' + error.status + ' Response: ' + error.data);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.processDirectoryNumberDetails = function (dn) {
        $scope.directoryNumberDetail = dn;
        $scope.assignedInternalNumber = {'pattern': dn.pattern.substr(1), 'id': dn.uuid};
      };

      $scope.getUnassignedDirectoryNumbers = function (user) {
        var deferred = $q.defer();
        // TODO: Remove the following line when we are authenticating with CMI
        delete $http.defaults.headers.common.Authorization;
        UnassignedDirectoryNumberService.get({customerId: user.meta.organizationID},
        function (data) {
            deferred.resolve(data);
          }, function (error) {
            Log.debug('getUnassignedDirectoryNumbers failed.  Status: ' + error.status + ' Response: ' + error.data);
            deferred.reject(error);
          });
        return deferred.promise;
      };

      $scope.processUnassignedDirectoryNumbers = function (unassignedNumbers) {
        var unassignedNumber = null;
        for (var i = 0; i < unassignedNumbers.length; i++) {
          unassignedNumber = {'pattern': unassignedNumbers[i].pattern.substr(1), 'id': unassignedNumbers[i].uuid};
          $scope.unassingedDirectoryNumbers.push(unassignedNumber);
        }
        unassignedNumber = {'pattern': $scope.directoryNumber.pattern.substr(1), 'id': $scope.directoryNumber.uuid};
        $scope.unassingedDirectoryNumbers.push(unassignedNumber);
      };

      $scope.removeDirectoryNumberAssociation = function(user) {
        var deferred = $q.defer();
        // TODO: Remove the following line when we are authenticating with CMI
        delete $http.defaults.headers.common.Authorization;

        UserDirectoryNumberService.delete({customerId: user.meta.organizationID, userId: user.id, directoryNumberId: $scope.directoryNumber.uuid},
        function(data) {
          deferred.resolve(data);
        },function(error) {
          Log.debug('removeDirectoryNumberAssociation failed.  Status: ' + error.status + ' Response: ' + error.data);
          deferred.reject(error);
        });
        return deferred.promise;
      };

      $scope.addDirectoryNumberAssociation = function(user) {
        var deferred = $q.defer();
        var userLine = {
          'dnUsage': $scope.directoryNumber.dnUsage,
          'directoryNumber': {
            'uuid': user.dn.uuid
          }
        };
        var result = {
          msg: null,
          type: 'null'
        };

        // TODO: Remove the following line when we are authenticating with CMI
        delete $http.defaults.headers.common.Authorization;

        UserDirectoryNumberService.save({customerId: user.meta.organizationID, userId: user.id }, userLine,
        function(data) {
          deferred.resolve(data);
          result.msg = $filter('translate')('directoryNumberPanel.removeSuccess');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        },function(error) {
          Log.debug('addDirectoryNumberAssociation failed.  Status: ' + error.status + ' Response: ' + error.data);
          deferred.reject(error);
        });
        return deferred.promise;
      };

      $scope.saveDirectoryNumber = function() {
        $scope.$emit('saveLineSettings');
      };

      $scope.$watch('directoryNumber', function (newVal, oldVal) {
        if (newVal) {
          $scope.getDirectoryNumberDetails($scope.currentUser)
            .then(function (response) {$scope.processDirectoryNumberDetails(response);})
            .catch(function (response) {$scope.processDirectoryNumberDetails(null);});
          $scope.getUnassignedDirectoryNumbers($scope.currentUser)
            .then(function (response) {$scope.processUnassignedDirectoryNumbers(response);})
            .catch(function (response) {$scope.processUnassignedDirectoryNumbers(null);});
        }
      });
    }
  ]);
