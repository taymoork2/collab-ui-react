'use strict';


angular.module('Huron')
   .controller('VoicemailInfoCtrl', ['$scope', '$q', '$http', 'UserServiceCommon', 'Log', 'Config', '$filter', 'Notification',
	function($scope, $q, $http, UserServiceCommon, Log, Config, $filter, Notification) {
	$scope.voicemailEnabled = false;

	$scope.$watch('telephonyUser', function(newVal, oldVal) {
		if (newVal) {
			if ($scope.isVoicemailEnabled()) {
				$scope.voicemailEnabled = true;
			} else {
				$scope.voicemailEnabled = false;
			}
		}
	});

	$scope.saveVoicemail = function() {
		var deferred = $q.defer();
		var result = {
      msg: null,
      type: 'null'
    };

		if ($scope.voicemailEnabled && !$scope.isVoicemailEnabled()) {
			$scope.telephonyUser.services.push('VOICEMAIL');

			if ($scope.directoryNumber === null || $scope.directoryNumber === undefined) {
				for (var i = 0; i < $scope.userDnList.length; i++) {
					if ($scope.userDnList[i].dnUsage === 'Main'){
						$scope.telephonyUser.voicemail = {'dtmfAccessId' : $scope.userDnList[i].pattern.substr(1)};
          }
        }
			} else {
				$scope.telephonyUser.voicemail = {'dtmfAccessId' : $scope.directoryNumber.pattern.substr(1)};
			}
			// TODO: Remove the following line when we are authenticating with CMI
			delete $http.defaults.headers.common.Authorization;
		} else {
			for (var j=0; j< $scope.telephonyUser.services.length; j++) {
        if($scope.telephonyUser.services[j] === 'VOICEMAIL') {
					$scope.telephonyUser.services.splice(j,1);
        }
      }
		}
		UserServiceCommon.update({customerId: $scope.currentUser.meta.organizationID, userId: $scope.currentUser.id},$scope.telephonyUser,
            function (data) {
              deferred.resolve(data);

              //change the panel to reflect on or off
              if ($scope.voicemailEnabled) {
								$scope.telephonyUserInfo.voicemail = 'On';
							} else {
								$scope.telephonyUserInfo.voicemail = 'Off';
							}

              result.msg = $filter('translate')('voicemailPanel.success');
              result.type = 'success';
              Notification.notify([result.msg], result.type);
            }, function (error) {
              Log.debug('getDirectoryNumberDetails failed.  Status: ' + error.status + ' Response: ' + error.data);
              result.msg = $filter('translate')('voicemailPanel.error') + error.data;
              result.type = 'error';
              Notification.notify([result.msg], result.type);
              deferred.reject(error);
            }
							);
	};
}
])
  .directive('voicemailInfo', function() {
    return {
      controller: 'VoicemailInfoCtrl',
      restrict: 'A',
      scope: false,
      templateUrl: 'modules/huron/scripts/directives/views/voicemail-info.html'
    };
  });