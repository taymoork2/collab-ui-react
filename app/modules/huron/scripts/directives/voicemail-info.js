'use strict';


angular.module('Huron')
   .controller('VoicemailInfoCtrl', ['$scope', '$q', '$http', 'UserServiceCommon', 'Log', 'Config', 'Notification',
	function($scope, $q, $http, UserServiceCommon, Log, Config, Notification) {
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

	$scope.save = function(user) {
		if ($scope.voicemailEnabled && !$scope.isVoicemailEnabled()) {
			$scope.telephonyUser.services.push('VOICEMAIL');
			$scope.telephonyUser.voicemail = {'dtmfAccessId' : $scope.directoryNumber.pattern.substr(1)};
			// TODO: Remove the following line when we are authenticating with CMI
			delete $http.defaults.headers.common.Authorization;
			UserServiceCommon.update({customerId: user.meta.organizationID, userId: user.id},$scope.telephonyUser);
		}
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