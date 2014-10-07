'use strict';

angular.module('Huron')
   .controller('SingleNumberReachInfoCtrl', ['$scope', '$q', '$http', 'RemoteDestinationService', 'Log', 'Config', 'Notification', '$filter',
	function($scope, $q, $http, RemoteDestinationService, Log, Config, Notification, $filter) {
	$scope.destination = null;
	$scope.remoteDestinations = null;
	$scope.singleNumberReachEnabled = false;
	$scope.snrOptions = [{
		label: 'All Lines',
		line: 'all'
	}, {
		label: 'Only certain lines',
		line: 'specific'
	}];
	$scope.snrLineOption = $scope.snrOptions[0];

	$scope.createRemoteDestinationInfo = function(user, destination) {
		var deferred = $q.defer();
		var rdBean = {'destination': destination,
					  'name' : 'RD-' + getRandomString(),
					  'autoAssignRemoteDestinationProfile' : true
					 };
		var result = {
			msg: null,
			type: 'null'
		};

		// TODO: Remove the following line when we are authenticating with CMI
		delete $http.defaults.headers.common.Authorization;
		RemoteDestinationService.save({customerId: user.meta.organizationID, userId: user.id }, rdBean,
			function(data) {
				deferred.resolve(data);

				//Update Telephony Panel
				if ($scope.singleNumberReachEnabled) {
					$scope.singleNumberReach = 'On';
				} else {
					$scope.singleNumberReach = 'Off';
				}

				result.msg = $filter('translate')('singleNumberReachPanel.success');
				result.type = 'success';
				Notification.notify([result.msg], result.type);
			},function(error) {
				Log.debug('updateRemoteDestinationInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
				result.msg = $filter('translate')('singleNumberReachPanel.error') + error.data;
				result.type = 'error';
				Notification.notify([result.msg], result.type);
				deferred.reject(error);
			});
		return deferred.promise;
	};

	$scope.deleteRemoteDestinationInfo = function(user) {
		var deferred = $q.defer();
		var result = {
			msg: null,
			type: 'null'
		};
		// TODO: Remove the following line when we are authenticating with CMI
		delete $http.defaults.headers.common.Authorization;
		RemoteDestinationService.delete({customerId: user.meta.organizationID, userId: user.id, remoteDestId: $scope.remoteDestinations[0].uuid},
			function(data) {
				deferred.resolve(data);
				$scope.destination = null;
				$scope.singleNumberReach = 'Off';
				result.msg = $filter('translate')('singleNumberReachPanel.removeSuccess');
				result.type = 'success';
				Notification.notify([result.msg], result.type);
			},function(error) {
				Log.debug('deleteRemoteDestinationInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
				result.msg = $filter('translate')('singleNumberReachPanel.error') + error.data;
				result.type = 'error';
				Notification.notify([result.msg], result.type);
				deferred.reject(error);
			});
		return deferred.promise;
	};

	$scope.getRemoteDestinationInfo = function(user) {
		var deferred = $q.defer();
		
		// TODO: Remove the following line when we are authenticating with CMI
		delete $http.defaults.headers.common.Authorization;
		RemoteDestinationService.query({customerId: user.meta.organizationID, userId: user.id},
			function(data) {
				deferred.resolve(data);
			},function(error) {
				Log.debug('getRemoteDestinationInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
				deferred.reject(error);
			});
		return deferred.promise;
	};

	$scope.processRemoteDestinationInfo = function(remoteDestinationInfo) {
		if (remoteDestinationInfo) {
			$scope.remoteDestinations = remoteDestinationInfo;
			if (remoteDestinationInfo !== null && remoteDestinationInfo !== undefined && remoteDestinationInfo.length > 0) {
				$scope.singleNumberReachEnabled = true;
				$scope.destination = remoteDestinationInfo[0].destination;
			} else {
				$scope.singleNumberReachEnabled = false;
			}
		} else {
			$scope.remoteDestinations = null;
		}
	};

	$scope.updateRemoteDestinationInfo = function(user, destination) {
		var deferred = $q.defer();
		var rdBean = {'destination': destination};
		var result = {
			msg: null,
			type: 'null'
		};

		// TODO: Remove the following line when we are authenticating with CMI
		delete $http.defaults.headers.common.Authorization;
		RemoteDestinationService.update({customerId: user.meta.organizationID, userId: user.id, remoteDestId: $scope.remoteDestinations[0].uuid}, rdBean,
			function(data) {
				deferred.resolve(data);

				//Update Telephony Panel
				if ($scope.singleNumberReachEnabled) {
					$scope.singleNumberReach = 'On';
				} else {
					$scope.singleNumberReach = 'Off';
				}

				result.msg = $filter('translate')('singleNumberReachPanel.success');
				result.type = 'success';
				Notification.notify([result.msg], result.type);
			},function(error) {
				Log.debug('updateRemoteDestinationInfo failed.  Status: ' + error.status + ' Response: ' + error.data);
				result.msg = $filter('translate')('singleNumberReachPanel.error') + error.data;
				result.type = 'error';
				Notification.notify([result.msg], result.type);
				deferred.reject(error);
			});
		return deferred.promise;
	};
	
	$scope.saveSingleNumberReach = function() {
		if ($scope.remoteDestinations !== null && $scope.remoteDestinations !== undefined && $scope.remoteDestinations.length > 0) {
			if (!$scope.singleNumberReachEnabled) {
				$scope.deleteRemoteDestinationInfo($scope.currentUser);
			} else {
				$scope.updateRemoteDestinationInfo($scope.currentUser, $scope.destination);
			}
		} else {
			$scope.createRemoteDestinationInfo($scope.currentUser, $scope.destination);
		}
	};

	$scope.$watch('currentUser', function(newVal, oldVal) {
        if (newVal) {
          if ($scope.isHuronEnabled()) {
            $scope.getRemoteDestinationInfo(newVal)
              .then(function(response) {$scope.processRemoteDestinationInfo(response);})
              .catch(function(response) {$scope.processRemoteDestinationInfo(null);});
          }
        }
      });
	
	var getRandomString = function() {
		var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		var randomString = '';
		for (var i = 0; i < 12; i++) {
			var randIndex = Math.floor(Math.random() * charSet.length);
			randomString += charSet.substring(randIndex,randIndex+1);
		}
		return randomString;
	};
}
])
  .directive('singleNumberReachInfo', function() {
    return {
      controller: 'SingleNumberReachInfoCtrl',
      restrict: 'A',
      scope: false,
      templateUrl: 'modules/huron/scripts/directives/views/singlenumberreach-info.html'
    };
  });