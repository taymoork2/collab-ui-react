(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('VoicemailInfoCtrl', VoicemailInfoCtrl);

  /* @ngInject */
  function VoicemailInfoCtrl($scope, $stateParams, $translate, $modal, UserServiceCommon, TelephonyInfoService, Notification, DirectoryNumber) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.saveVoicemail = saveVoicemail;
    vm.reset = reset;
    vm.directoryNumber = DirectoryNumber.getNewDirectoryNumber();
    vm.saveInProcess = false;

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
      var promise;
      var promises = [];
      var voicemailPayload = {
        'services': [],
        'voicemail': {}
      };

      var result = {
        msg: null,
        type: 'null'
      };

      if (vm.enableVoicemail) {
        if (!isVoicemailEnabled()) {
          vm.telephonyInfo.services.push('VOICEMAIL');
        }

        voicemailPayload.voicemail = {
          'dtmfAccessId': vm.telephonyInfo.esn
        };
        updateVoicemail(voicemailPayload, result);
      } else {
        $modal.open({
          templateUrl: 'modules/huron/voicemail/disableConfirmation.tpl.html',
          scope: $scope
        }).result.then(function () {
          for (var j = 0; j < vm.telephonyInfo.services.length; j++) {
            if (vm.telephonyInfo.services[j] === 'VOICEMAIL') {
              vm.telephonyInfo.services.splice(j, 1);
            }
          }
          updateVoicemail(voicemailPayload, result);
        }, function () {
          vm.reset();
        });
      }
    }

    function updateVoicemail(voicemailPayload, result) {
      vm.saveInProcess = true;
      voicemailPayload.services = vm.telephonyInfo.services;

      //VOICE service is required for voicemail enable/disable so add it
      var hasVoiceService = _.find(voicemailPayload.services, function (service) {
        return service === 'VOICE';
      });
      if (!hasVoiceService) {
        voicemailPayload.services.push('VOICE');
      }

      UserServiceCommon.update({
          customerId: vm.currentUser.meta.organizationID,
          userId: vm.currentUser.id
        }, voicemailPayload).$promise
        .then(function () {
          resetForm();
          result.msg = $translate.instant('voicemailPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
          return TelephonyInfoService.updateUserServices(vm.telephonyInfo.services);
        })
        .catch(function (response) {
          result.msg = $translate.instant('voicemailPanel.error') + response.data.errorMessage;
          result.type = 'error';
          Notification.notify([result.msg], result.type);
        })
        .finally(function () {
          vm.saveInProcess = false;
        });
    }
  }
})();
