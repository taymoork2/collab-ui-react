(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('VoicemailInfoCtrl', VoicemailInfoCtrl);

  /* @ngInject */
  function VoicemailInfoCtrl($scope, $stateParams, $translate, $modal, UserServiceCommon, TelephonyInfoService, Notification, HttpUtils) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.saveVoicemail = saveVoicemail;
    vm.reset = reset;

    init();

    $scope.$on('telephonyInfoUpdated', function () {
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
    });

    function init() {
      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
      vm.enableVoicemail = isVoicemailEnabled();
    }

    function resetForm() {
      if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function reset() {
      resetForm();
      init();
    }

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

          for (var i = 0; i < vm.telephonyInfo.directoryNumbers.length; i++) {
            var dn = vm.telephonyInfo.directoryNumbers[i];
            if (dn.dnUsage === 'Primary') {
              voicemailPayload.voicemail = {
                'dtmfAccessId': dn.altDnPattern ? dn.altDnPattern : dn.pattern
              };
              voicemailPayload.userName = vm.currentUser.userName;
              break;
            }
          }
          updateVoicemail(voicemailPayload, result);
        } else {
          $modal.open({
            templateUrl: 'modules/huron/voicemail/disableConfirmation.tpl.html',
            scope: $scope,
            size: 'sm'
          }).result.then(function () {
            for (var j = 0; j < vm.telephonyInfo.services.length; j++) {
              if (vm.telephonyInfo.services[j] === 'VOICEMAIL') {
                vm.telephonyInfo.services.splice(j, 1);
              }
            }
            updateVoicemail(voicemailPayload, result);
          }, function () {
            vm.reset();
            angular.element('#btnSaveVoicemail').button('reset');
          });
        }
      });
    }

    function updateVoicemail(voicemailPayload, result) {
      voicemailPayload.services = vm.telephonyInfo.services;
      UserServiceCommon.update({
          customerId: vm.currentUser.meta.organizationID,
          userId: vm.currentUser.id
        },
        voicemailPayload,
        function () {
          angular.element('#btnSaveVoicemail').button('reset');
          resetForm();
          result.msg = $translate.instant('voicemailPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
          TelephonyInfoService.updateUserServices(vm.telephonyInfo.services);
        },
        function (response) {
          result.msg = $translate.instant('voicemailPanel.error') + response.data.errorMessage;
          result.type = 'error';
          Notification.notify([result.msg], result.type);
          angular.element('#btnSaveVoicemail').button('reset');
        }
      );
    }
  }
})();
