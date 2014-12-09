(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('VoicemailInfoCtrl', ['$scope', '$q', 'UserServiceCommon', 'TelephonyInfoService', 'Log', 'Config', '$filter', 'Notification',
      function ($scope, $q, UserServiceCommon, TelephonyInfoService, Log, Config, $filter, Notification) {
        $scope.voicemailEnabled = false;
        $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();

        $scope.voicemailPayload = {
          'services': [],
          'voicemail': {}
        };

        $scope.$on('telephonyInfoUpdated', function () {
          $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
        });

        $scope.isVoicemailEnabled = function () {
          var voicemailEnabled = false;
          if ($scope.telephonyInfo.services !== null && $scope.telephonyInfo.services.length > 0) {
            for (var j = 0; j < $scope.telephonyInfo.services.length; j++) {
              if ($scope.telephonyInfo.services[j] === 'VOICEMAIL') {
                voicemailEnabled = true
              }
            }
          }
          return voicemailEnabled;
        };

        $scope.voicemailEnabled = $scope.isVoicemailEnabled();

        $scope.saveVoicemail = function () {
          var deferred = $q.defer();
          var result = {
            msg: null,
            type: 'null'
          };

          angular.element('#btnSaveVoicemail').button('loading');
          if (!$scope.isVoicemailEnabled()) {
            $scope.telephonyInfo.services.push('VOICEMAIL');

            if (typeof $scope.directoryNumber === 'undefined') {
              for (var i = 0; i < $scope.telephonyInfo.directoryNumbers.length; i++) {
                if ($scope.telephonyInfo.directoryNumbers[i].dnUsage === 'Primary') {
                  $scope.voicemailPayload.voicemail = {
                    'dtmfAccessId': $scope.telephonyInfo.directoryNumbers[i].pattern
                  };
                  $scope.voicemailPayload.userId = $scope.currentUser.userName;
                }
              }
            } else {
              $scope.voicemailPayload.voicemail = {
                'dtmfAccessId': $scope.directoryNumber.pattern
              };
            }
          } else {
            for (var j = 0; j < $scope.telephonyInfo.services.length; j++) {
              if ($scope.telephonyInfo.services[j] === 'VOICEMAIL') {
                $scope.telephonyInfo.services.splice(j, 1);
              }
            }
          }
          $scope.voicemailPayload.services = $scope.telephonyInfo.services;
          UserServiceCommon.update({
              customerId: $scope.currentUser.meta.organizationID,
              userId: $scope.currentUser.id
            }, $scope.voicemailPayload,
            function (data) {
              deferred.resolve(data);
              angular.element('#btnSaveVoicemail').button('reset');
              result.msg = $filter('translate')('voicemailPanel.success');
              result.type = 'success';
              Notification.notify([result.msg], result.type);
              TelephonyInfoService.updateUserServices($scope.telephonyInfo.services);
            },
            function (error) {
              Log.debug('getDirectoryNumberDetails failed.  Status: ' + error.status + ' Response: ' + error.data);
              result.msg = $filter('translate')('voicemailPanel.error') + error.data;
              result.type = 'error';
              Notification.notify([result.msg], result.type);
              deferred.reject(error);
              angular.element('#btnSaveVoicemail').button('reset');
            }
          );
        };
      }
    ]);
})();
