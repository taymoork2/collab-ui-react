'use strict';

angular.module('Huron')
        .controller('DirectoryNumberInfoCtrl', ['$scope', '$q', '$http', 'UserDirectoryNumberService', 'UnassignedDirectoryNumberService', 'UserDirectoryNumberDetailService', 'Log', 'Config', 'Notification',
            function ($scope, $q, $http, UserDirectoryNumberService, UnassignedDirectoryNumberService, UserDirectoryNumberDetailService, Log, Config, Notification) {
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
                    $scope.assignedInternalNumber = {'pattern': dn.pattern, 'id': dn.uuid};
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
                    unassignedNumber = {'pattern': unassignedNumbers[i].pattern, 'id': unassignedNumbers[i].uuid};
                    $scope.unassingedDirectoryNumbers.push(unassignedNumber);
                  }
                  unassignedNumber = {'pattern': $scope.directoryNumberDetail.pattern, 'id': $scope.directoryNumberDetail.uuid};
                  $scope.unassingedDirectoryNumbers.push(unassignedNumber);
                };

                $scope.$watch('directoryNumber', function (newVal, oldVal) {
                    if (newVal) {
                      $scope.getDirectoryNumberDetails($scope.currentUser)
                                .then(function (response) { $scope.processDirectoryNumberDetails(response); })
                                .catch(function (response) {$scope.processDirectoryNumberDetails(null);});
                      $scope.getUnassignedDirectoryNumbers($scope.currentUser)
                                .then(function (response) {$scope.processUnassignedDirectoryNumbers(response);})
                                .catch(function (response) {$scope.processUnassignedDirectoryNumbers(null);});
                    }
                  });
              }
        ])
        .directive('directoryNumberInfo', function () {
            return {
                controller: 'DirectoryNumberInfoCtrl',
                restrict: 'A',
                scope: false,
                templateUrl: 'modules/huron/scripts/directives/views/directorynumber-info.html'
              };
          });