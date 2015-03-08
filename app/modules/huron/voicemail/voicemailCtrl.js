(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('VoicemailInfoCtrl', VoicemailInfoCtrl);

  /* @ngInject */
  function VoicemailInfoCtrl($scope, $translate, UserServiceCommon, TelephonyInfoService, Notification, HttpUtils) {
    var vm = this;
    vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
    vm.enableVoicemail = isVoicemailEnabled();
    vm.saveVoicemail = saveVoicemail;

    $scope.$on('telephonyInfoUpdated', function () {
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
    });

    function isVoicemailEnabled() {
      var voicemailEnabled = false;
      if (vm.telephonyInfo.services !== null && vm.telephonyInfo.services.length > 0) {
        for (var j = 0; j < vm.telephonyInfo.services.length; j++) {
          if (vm.telephonyInfo.services[j] === 'VOICEMAIL') {
            voicemailEnabled = true;
          }
        }
      }
      return voicemailEnabled;
    }

    function saveVoicemail() {
      var voicemailPayload = {
        'services': [],
        'voicemail': {}
      };
      HttpUtils.setTrackingID().then(function () {
        var result = {
          msg: null,
          type: 'null'
        };

        angular.element('#btnSaveVoicemail').button('loading');
        if (vm.enableVoicemail) {
          if (!isVoicemailEnabled()) {
            vm.telephonyInfo.services.push('VOICEMAIL');
          }

          if (typeof $scope.directoryNumber === 'undefined') {
            for (var i = 0; i < vm.telephonyInfo.directoryNumbers.length; i++) {
              if (vm.telephonyInfo.directoryNumbers[i].dnUsage === 'Primary') {
                voicemailPayload.voicemail = {
                  'dtmfAccessId': vm.telephonyInfo.directoryNumbers[i].pattern
                };
                voicemailPayload.userName = $scope.currentUser.userName;
              }
            }
          } else {
            voicemailPayload.voicemail = {
              'dtmfAccessId': $scope.directoryNumber.pattern
            };
          }
        } else {
          for (var j = 0; j < vm.telephonyInfo.services.length; j++) {
            if (vm.telephonyInfo.services[j] === 'VOICEMAIL') {
              vm.telephonyInfo.services.splice(j, 1);
            }
          }
        }
        voicemailPayload.services = vm.telephonyInfo.services;
        UserServiceCommon.update({
            customerId: $scope.currentUser.meta.organizationID,
            userId: $scope.currentUser.id
          },
          voicemailPayload,
          function () {
            angular.element('#btnSaveVoicemail').button('reset');
            result.msg = $translate.instant('voicemailPanel.success');
            result.type = 'success';
            Notification.notify([result.msg], result.type);
            TelephonyInfoService.updateUserServices(vm.telephonyInfo.services);
          },
          function (response) {
            result.msg = $translate.instant('voicemailPanel.error') + response.data;
            result.type = 'error';
            Notification.notify([result.msg], result.type);
            angular.element('#btnSaveVoicemail').button('reset');
          }
        );
      });
    }
  }
})();
