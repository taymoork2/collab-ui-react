(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('VoicemailInfoCtrl', VoicemailInfoCtrl);

  /* @ngInject */
  function VoicemailInfoCtrl($scope, $stateParams, $translate, $modal, $q, UserServiceCommon, TelephonyInfoService, Notification, HttpUtils, LineSettings, DirectoryNumber) {
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
      HttpUtils.setTrackingID().then(function () {
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
          updateVoicemail(voicemailPayload, result, true);
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
            updateVoicemail(voicemailPayload, result, false);
          }, function () {
            vm.reset();
          });
        }
      });
    }

    function updateVoicemail(voicemailPayload, result, voicemailEnabled) {
      vm.saveInProcess = true;
      voicemailPayload.services = vm.telephonyInfo.services;
      UserServiceCommon.update({
          customerId: vm.currentUser.meta.organizationID,
          userId: vm.currentUser.id
        }, voicemailPayload).$promise
        .then(function () {
          var promises = updateLineVoicemail(voicemailEnabled);
          return $q.all(promises)
            .then(function () {
              resetForm();
              result.msg = $translate.instant('voicemailPanel.success');
              result.type = 'success';
              Notification.notify([result.msg], result.type);
              TelephonyInfoService.updateUserServices(vm.telephonyInfo.services);
            })
            .catch(function (response) {
              Notification.errorResponse(response, 'directoryNumberPanel.error');
            });
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

    function updateLineVoicemail(value) {
      var promise;
      var promises = [];
      // update the cfwdall and cfwNAB to voicemail enabled 'f' in case they are set to true
      for (var num in vm.telephonyInfo.directoryNumbers) {
        var dn = vm.telephonyInfo.directoryNumbers[num];
        if (dn.uuid !== null) {
          DirectoryNumber.getDirectoryNumber(dn.uuid).then(function (dn) {
            vm.directoryNumber = dn;
            if (!value) {
              vm.directoryNumber.callForwardAll.voicemailEnabled = value;
              vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = value;
              vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = value;
            }
            if (!value || isCallForwardingDisabled(dn)) {
              vm.directoryNumber.callForwardBusy.voicemailEnabled = value;
              vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = value;
              vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = value;
              vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = value;
              promise = LineSettings.updateLineSettings(vm.directoryNumber);
              promises.push(promise);
            }
          });
        }
      }
      return promises;
    }

    function isCallForwardingDisabled(dn) {
      return ((angular.isUndefined(dn.callForwardAll.destination) ||
          dn.callForwardAll.destination === null) &&
        (angular.isUndefined(dn.callForwardBusy.intDestination) ||
          dn.callForwardBusy.intDestination === null) &&
        (angular.isUndefined(dn.callForwardBusy.destination) ||
          dn.callForwardBusy.destination === null) &&
        (angular.isUndefined(dn.callForwardNoAnswer.destination) ||
          dn.callForwardNoAnswer.destination === null) &&
        (angular.isUndefined(dn.callForwardNoAnswer.intDestination) ||
          dn.callForwardNoAnswer.intDestination === null));
    }
  }
})();
