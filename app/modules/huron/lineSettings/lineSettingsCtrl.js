(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LineSettingsCtrl', LineSettingsCtrl);

  /* @ngInject */
  function LineSettingsCtrl($scope, $state, $stateParams, $translate, $q, $modal, Log, Notification, DirectoryNumber, TelephonyInfoService, LineSettings, HuronAssignedLine, HttpUtils) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.cbAddText = $translate.instant('callForwardPanel.addNew');
    vm.title = $translate.instant('directoryNumberPanel.title');
    vm.forward = 'busy';
    vm.forwardAllCalls = '';
    vm.forwardExternalCalls = false;
    vm.forwardNABCalls = '';
    vm.forwardExternalNABCalls = '';
    vm.validForwardOptions = [];
    vm.directoryNumber = DirectoryNumber.getNewDirectoryNumber();
    vm.internalNumberPool = [];
    vm.externalNumberPool = [];

    // Caller ID Radio Button Model
    var name;
    if (vm.currentUser.name) {
      name = (vm.currentUser.name.givenName + ' ' + vm.currentUser.name.familyName).trim();
    } else {
      name = vm.currentUser.userName;
    }
    vm.callerIdInfo = {
      'default': name,
      'otherName': null,
      'selection': 'default'
    };

    vm.additionalBtn = {
      label: 'directoryNumberPanel.removeNumber',
      btnclass: 'btn btn-default btn-remove',
      id: 'btn-remove'
    };

    vm.saveLineSettings = saveLineSettings;
    vm.deleteLineSettings = deleteLineSettings;

    ////////////

    function activate() {
      var directoryNumber = $stateParams.directoryNumber;
      if (directoryNumber) {
        if (directoryNumber === 'new') {
          TelephonyInfoService.updateCurrentDirectoryNumber('new');
        }
      }

      initDirectoryNumber(directoryNumber);

      vm.assignedInternalNumber = {
        uuid: 'none',
        pattern: ''
      };
      vm.assignedExternalNumber = {
        uuid: 'none',
        pattern: 'None'
      };

      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
      vm.internalNumberPool = TelephonyInfoService.getInternalNumberPool();
      vm.externalNumberPool = TelephonyInfoService.getExternalNumberPool();

      if (vm.telephonyInfo.voicemail === 'On') {
        if (!_.contains(vm.validForwardOptions, 'Voicemail')) {
          vm.validForwardOptions.push('Voicemail');
        }
      }

      if (typeof vm.telephonyInfo.currentDirectoryNumber.uuid !== 'undefined' && vm.telephonyInfo.currentDirectoryNumber.uuid !== 'new') {
        DirectoryNumber.getDirectoryNumber(vm.telephonyInfo.currentDirectoryNumber.uuid).then(function (dn) {
          var internalNumber = {
            'uuid': dn.uuid,
            'pattern': dn.pattern
          };

          vm.directoryNumber = dn;
          vm.assignedInternalNumber = internalNumber;

          vm.internalNumberPool = TelephonyInfoService.getInternalNumberPool();
          if (vm.internalNumberPool.length === 0) {
            TelephonyInfoService.loadInternalNumberPool().then(function (internalNumberPool) {
              vm.internalNumberPool = internalNumberPool;
              vm.internalNumberPool.push(internalNumber);
            });
          } else {
            vm.internalNumberPool.push(internalNumber);
          }

          initCallForward();
          initCallerId();
        });

        if (typeof vm.telephonyInfo.alternateDirectoryNumber.uuid !== 'undefined' && vm.telephonyInfo.alternateDirectoryNumber.uuid !== '') {
          vm.assignedExternalNumber = vm.telephonyInfo.alternateDirectoryNumber;

          if (vm.externalNumberPool.length === 0) {
            TelephonyInfoService.loadExternalNumberPool().then(function (externalNumberPool) {
              vm.externalNumberPool = externalNumberPool;
              vm.externalNumberPool.push(vm.telephonyInfo.alternateDirectoryNumber);
            });
          } else {
            vm.externalNumberPool.push(vm.telephonyInfo.alternateDirectoryNumber);
          }
        }

      } else { // add new dn case
        HuronAssignedLine.getUnassignedDirectoryNumber().then(function (dn) {
          if (typeof dn !== 'undefined') {
            var internalNumber = {
              'uuid': dn.uuid,
              'pattern': dn.pattern
            };
            vm.assignedInternalNumber = internalNumber;
          }
        });
        vm.forward = 'none';
        initCallerId();
      }

      if ((vm.telephonyInfo.currentDirectoryNumber.dnUsage !== 'Primary') && (vm.telephonyInfo.currentDirectoryNumber.uuid !== 'new')) {
        // Can't remove primary line
        vm.additionalBtn.show = true;

        if (vm.telephonyInfo.currentDirectoryNumber.userDnUuid === "none") {
          TelephonyInfoService.resetCurrentUser(vm.telephonyInfo.currentDirectoryNumber.uuid);
          vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
        }
      }
    }

    function initDirectoryNumber(directoryNumber) {
      if (directoryNumber === 'new') {
        TelephonyInfoService.updateCurrentDirectoryNumber('new');
      } else {
        // update alternate number first
        TelephonyInfoService.updateAlternateDirectoryNumber(directoryNumber.altDnUuid, directoryNumber.altDnPattern);
        TelephonyInfoService.updateCurrentDirectoryNumber(directoryNumber.uuid, directoryNumber.pattern, directoryNumber.dnUsage, directoryNumber.userDnUuid);
      }
    }

    function saveLineSettings() {
      HttpUtils.setTrackingID().then(function () {
        processCallerId();
        var callForwardSet = processCallForward();

        if (callForwardSet === true) {
          if (typeof vm.directoryNumber.uuid !== 'undefined' && vm.directoryNumber.uuid !== '') { // line exists
            var promise;
            var promises = [];
            if (vm.telephonyInfo.currentDirectoryNumber.uuid !== vm.assignedInternalNumber.uuid) { // internal line
              promise = LineSettings.changeInternalLine(vm.telephonyInfo.currentDirectoryNumber.uuid, vm.telephonyInfo.currentDirectoryNumber.dnUsage, vm.assignedInternalNumber.pattern, vm.directoryNumber)
                .then(function () {
                  vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                  vm.directoryNumber.uuid = vm.telephonyInfo.currentDirectoryNumber.uuid;
                  vm.directoryNumber.pattern = vm.telephonyInfo.currentDirectoryNumber.pattern;
                  processInternalNumberList();
                });
              promises.push(promise);
            } else { // no line change, just update settings
              promise = LineSettings.updateLineSettings(vm.directoryNumber);
              promises.push(promise);
            }

            if (vm.telephonyInfo.alternateDirectoryNumber.uuid !== vm.assignedExternalNumber.uuid) { // external line
              if ((vm.telephonyInfo.alternateDirectoryNumber.uuid === '' || vm.telephonyInfo.alternateDirectoryNumber.uuid === 'none') && vm.assignedExternalNumber.uuid !== 'none') { // no existing external line, add external line
                promise = LineSettings.addExternalLine(vm.directoryNumber.uuid, vm.assignedExternalNumber.pattern)
                  .then(function () {
                    processExternalNumberList();
                  });
                promises.push(promise);
              } else if ((vm.telephonyInfo.alternateDirectoryNumber.uuid !== '' || vm.telephonyInfo.alternateDirectoryNumber.uuid !== 'none') && vm.assignedExternalNumber.uuid !== 'none') { // changing external line
                promise = LineSettings.changeExternalLine(vm.directoryNumber.uuid, vm.telephonyInfo.alternateDirectoryNumber.uuid, vm.assignedExternalNumber.pattern)
                  .then(function () {
                    processExternalNumberList();
                  });
                promises.push(promise);
              } else if (vm.telephonyInfo.alternateDirectoryNumber.uuid !== '' && vm.assignedExternalNumber.uuid === 'none') {
                promise = LineSettings.deleteExternalLine(vm.directoryNumber.uuid, vm.telephonyInfo.alternateDirectoryNumber.uuid)
                  .then(function () {
                    processExternalNumberList();
                  });
                promises.push(promise);
              }
            }

            $q.all(promises)
              .then(function () {
                TelephonyInfoService.getUserDnInfo(vm.currentUser.id)
                  .then(function () {
                    if (vm.telephonyInfo.currentDirectoryNumber.userDnUuid === "none") {
                      TelephonyInfoService.resetCurrentUser(vm.telephonyInfo.currentDirectoryNumber.uuid);
                      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                    }
                  });
                Notification.notify([$translate.instant('directoryNumberPanel.success')], 'success');
              })
              .catch(function (response) {
                Log.debug('saveLineSettings failed.  Status: ' + response.status + ' Response: ' + response.data);
                Notification.notify([$translate.instant('directoryNumberPanel.error')], 'error');
              });

          } else { // new line
            LineSettings.addNewLine(vm.currentUser.id, getDnUsage(), vm.assignedInternalNumber.pattern, vm.directoryNumber, vm.assignedExternalNumber)
              .then(function () {
                return TelephonyInfoService.getUserDnInfo(vm.currentUser.id)
                  .then(function () {
                    vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                    vm.directoryNumber.uuid = vm.telephonyInfo.currentDirectoryNumber.uuid;
                    vm.directoryNumber.pattern = vm.telephonyInfo.currentDirectoryNumber.pattern;
                    Notification.notify([$translate.instant('directoryNumberPanel.success')], 'success');
                    $state.go('users.list.preview.directorynumber', {
                      directoryNumber: vm.directoryNumber.uuid
                    });
                  });
              })
              .catch(function (response) {
                Log.debug('addNewLine failed.  Status: ' + response.status + ' Response: ' + response.data);
                Notification.notify([$translate.instant('directoryNumberPanel.error')], 'error');
              });
          }
        }
      });
    }

    function deleteLineSettings() {
      HttpUtils.setTrackingID().then(function () {
        // fill in the {{line}} and {{user}} for directoryNumberPanel.deleteConfirmation
        vm.confirmationDialogue = $translate.instant('directoryNumberPanel.deleteConfirmation', {
          line: vm.telephonyInfo.currentDirectoryNumber.pattern,
          user: vm.callerIdInfo.default
        });

        $modal.open({
          templateUrl: 'modules/huron/lineSettings/deleteConfirmation.tpl.html',
          scope: $scope
        }).result.then(function () {
          return LineSettings.disassociateInternalLine(vm.currentUser.id, vm.telephonyInfo.currentDirectoryNumber.userDnUuid)
            .then(function () {
              TelephonyInfoService.getUserDnInfo(vm.currentUser.id);
              vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
              Notification.notify([$translate.instant('directoryNumberPanel.disassociationSuccess')], 'success');
              $state.go('users.list.preview');
            })
            .catch(function (response) {
              Log.debug('disassociateInternalLine failed.  Status: ' + response.status + ' Response: ' + response.data);
              Notification.notify([$translate.instant('directoryNumberPanel.error')], 'error');
            });
        });
      });
    }

    // this is used to determine dnUsage for new internal lines
    function getDnUsage() {
      var dnUsage = 'Undefined';
      if (vm.telephonyInfo.directoryNumbers.length === 0) {
        dnUsage = 'Primary';
      }
      return dnUsage;
    }

    function initCallerId() {
      if (vm.directoryNumber.alertingName !== vm.callerIdInfo.default && vm.directoryNumber.alertingName !== '') {
        vm.callerIdInfo.otherName = vm.directoryNumber.alertingName;
        vm.callerIdInfo.selection = 'other';
      } else {
        vm.callerIdInfo.selection = 'default';
        vm.callerIdInfo.otherName = null;
      }
    }

    function processCallerId() {
      if (vm.callerIdInfo.selection === 'default') {
        vm.directoryNumber.alertingName = vm.callerIdInfo.default;
      } else {
        vm.directoryNumber.alertingName = vm.callerIdInfo.otherName;
      }
    }

    // Call Forward Radio Button Model
    function initCallForward() {
      if (vm.directoryNumber.callForwardAll.voicemailEnabled === 'true' || vm.directoryNumber.callForwardAll.destination !== null) {
        vm.forward = 'all';
      } else if (vm.directoryNumber.callForwardAll.voicemailEnabled === 'false' && vm.directoryNumber.callForwardAll.destination === null && vm.directoryNumber.callForwardBusy.voicemailEnabled === 'false' && vm.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'false' && vm.directoryNumber.callForwardBusy.destination === null && vm.directoryNumber.callForwardBusy.intDestination === null && vm.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'false' && vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'false' && vm.directoryNumber.callForwardNoAnswer.destination === null && vm.directoryNumber.callForwardNoAnswer.intDestination === null) {
        vm.forward = 'none';
      } else {
        vm.forward = 'busy';
        if (vm.directoryNumber.callForwardBusy.voicemailEnabled !== vm.directoryNumber.callForwardBusy.intVoiceMailEnabled ||
          vm.directoryNumber.callForwardNoAnswer.voicemailEnabled !== vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled ||
          vm.directoryNumber.callForwardBusy.destination !== vm.directoryNumber.callForwardBusy.intDestination ||
          vm.directoryNumber.callForwardNoAnswer.destination !== vm.directoryNumber.callForwardNoAnswer.intDestination) {
          vm.forwardExternalCalls = true;
        }
      }

      if ((vm.telephonyInfo.voicemail === 'On') && (vm.directoryNumber.callForwardAll.voicemailEnabled === 'true')) {
        vm.forwardAllCalls = 'Voicemail';
      } else {
        vm.forwardAllCalls = vm.directoryNumber.callForwardAll.destination;
      }

      if ((vm.telephonyInfo.voicemail === 'On') && (vm.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'true' || vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'true' || vm.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
        vm.forwardNABCalls = 'Voicemail';
      } else {
        vm.forwardNABCalls = vm.directoryNumber.callForwardBusy.intDestination; //CallForwardNoAnswer is the same value, chose shorter variable name
      }

      if ((vm.telephonyInfo.voicemail === 'On') && (vm.directoryNumber.callForwardBusy.voicemailEnabled === 'true' || vm.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'true' || vm.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
        vm.forwardExternalNABCalls = 'Voicemail';
      } else {
        vm.forwardExternalNABCalls = vm.directoryNumber.callForwardBusy.destination;
      }
    }

    function processCallForward() {
      if (vm.forward === 'all') {
        vm.directoryNumber.callForwardBusy.voicemailEnabled = false;
        vm.directoryNumber.callForwardBusy.destination = '';
        vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
        vm.directoryNumber.callForwardBusy.intDestination = '';
        vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
        vm.directoryNumber.callForwardNoAnswer.destination = '';
        vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
        vm.directoryNumber.callForwardNoAnswer.intDestination = '';
        vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
        vm.directoryNumber.callForwardNotRegistered.destination = '';
        vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
        vm.directoryNumber.callForwardNotRegistered.intDestination = '';

        if (vm.forwardAllCalls === 'Voicemail') {
          vm.directoryNumber.callForwardAll.voicemailEnabled = true;
          vm.directoryNumber.callForwardAll.destination = '';
        } else if (vm.forwardAllCalls !== '') {
          vm.directoryNumber.callForwardAll.voicemailEnabled = false;
          vm.directoryNumber.callForwardAll.destination = vm.forwardAllCalls;
        } else {
          return false;
        }
      } else if (vm.forward === 'none') {
        vm.directoryNumber.callForwardAll.voicemailEnabled = false;
        vm.directoryNumber.callForwardAll.destination = '';
        vm.directoryNumber.callForwardBusy.voicemailEnabled = false;
        vm.directoryNumber.callForwardBusy.destination = '';
        vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
        vm.directoryNumber.callForwardBusy.intDestination = '';
        vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
        vm.directoryNumber.callForwardNoAnswer.destination = '';
        vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
        vm.directoryNumber.callForwardNoAnswer.intDestination = '';
        vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
        vm.directoryNumber.callForwardNotRegistered.destination = '';
        vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
        vm.directoryNumber.callForwardNotRegistered.intDestination = '';
      } else {
        vm.directoryNumber.callForwardAll.voicemailEnabled = false;
        vm.directoryNumber.callForwardAll.destination = '';

        if (vm.forwardExternalCalls) {

          if (vm.forwardNABCalls === 'Voicemail') {
            vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = true;
            vm.directoryNumber.callForwardBusy.intDestination = '';
            vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = true;
            vm.directoryNumber.callForwardNoAnswer.intDestination = '';
            vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = true;
            vm.directoryNumber.callForwardNotRegistered.intDestination = '';
          } else if (vm.forwardNABCalls !== '') {
            vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardBusy.intDestination = vm.forwardNABCalls;
            vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardNoAnswer.intDestination = vm.forwardNABCalls;
            vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardNotRegistered.intDestination = vm.forwardNABCalls;
          } else {
            return false;
          }

          if (vm.forwardExternalNABCalls === 'Voicemail') {
            vm.directoryNumber.callForwardBusy.voicemailEnabled = true;
            vm.directoryNumber.callForwardBusy.destination = '';
            vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = true;
            vm.directoryNumber.callForwardNoAnswer.destination = '';
            vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = true;
            vm.directoryNumber.callForwardNotRegistered.destination = '';
          } else if (vm.forwardExternalNABCalls !== '') {
            vm.directoryNumber.callForwardBusy.voicemailEnabled = false;
            vm.directoryNumber.callForwardBusy.destination = vm.forwardExternalNABCalls;
            vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
            vm.directoryNumber.callForwardNoAnswer.destination = vm.forwardExternalNABCalls;
            vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
            vm.directoryNumber.callForwardNotRegistered.destination = vm.forwardExternalNABCalls;
          } else {
            return false;
          }
        } else {
          if (vm.forwardNABCalls === 'Voicemail') {
            vm.directoryNumber.callForwardBusy.voicemailEnabled = true;
            vm.directoryNumber.callForwardBusy.destination = '';
            vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = true;
            vm.directoryNumber.callForwardBusy.intDestination = '';
            vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = true;
            vm.directoryNumber.callForwardNoAnswer.destination = '';
            vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = true;
            vm.directoryNumber.callForwardNoAnswer.intDestination = '';
            vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = true;
            vm.directoryNumber.callForwardNotRegistered.destination = '';
            vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = true;
            vm.directoryNumber.callForwardNotRegistered.intDestination = '';
          } else if (vm.forwardNABCalls !== '') {
            vm.directoryNumber.callForwardBusy.voicemailEnabled = false;
            vm.directoryNumber.callForwardBusy.destination = vm.forwardNABCalls;
            vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardBusy.intDestination = vm.forwardNABCalls;
            vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
            vm.directoryNumber.callForwardNoAnswer.destination = vm.forwardNABCalls;
            vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardNoAnswer.intDestination = vm.forwardNABCalls;
            vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
            vm.directoryNumber.callForwardNotRegistered.destination = vm.forwardNABCalls;
            vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardNotRegistered.intDestination = vm.forwardNABCalls;
          } else {
            return false;
          }
        }
      }

      return true;
    }

    //fucntion keeps voicemail the default in real time if it is on and no other desination has been set
    $scope.$watch('forward', function () {
      if (vm.forward === 'all' && vm.telephonyInfo.voicemail === 'On') {
        if (vm.directoryNumber.callForwardAll.destination === null) {
          vm.forwardAllCalls = 'Voicemail';
        } else {
          vm.forwardAllCalls = vm.directoryNumber.callForwardAll.destination;
        }
      } else if (vm.forward === 'busy' && vm.telephonyInfo.voicemail === 'On') {
        if (vm.directoryNumber.callForwardBusy.destination === null || vm.directoryNumber.callForwardNoAnswer.destination === null) {
          vm.forwardNABCalls = 'Voicemail';
        } else {
          vm.forwardNABCalls = vm.directoryNumber.callForwardBusy.destination;
        }
      } else {
        return false;
      }
    });

    function processInternalNumberList() {
      var telephonyInfo = TelephonyInfoService.getTelephonyInfo();
      var intNumPool = TelephonyInfoService.getInternalNumberPool();
      var internalNumber = {
        'uuid': telephonyInfo.currentDirectoryNumber.uuid,
        'pattern': telephonyInfo.currentDirectoryNumber.pattern
      };

      if (internalNumber.uuid !== '' && internalNumber.uuid !== 'none') {
        intNumPool.push(internalNumber);
      }

      vm.assignedInternalNumber = internalNumber;
      vm.internalNumberPool = intNumPool;
    }

    function processExternalNumberList() {
      var telephonyInfo = TelephonyInfoService.getTelephonyInfo();
      var extNumPool = TelephonyInfoService.getExternalNumberPool();
      var externalNumber = {
        'uuid': telephonyInfo.alternateDirectoryNumber.uuid,
        'pattern': telephonyInfo.alternateDirectoryNumber.pattern
      };

      if (externalNumber.uuid !== '' && externalNumber.uuid !== 'none') {
        extNumPool.push(externalNumber);
      }

      vm.assignedExternalNumber = externalNumber;
      vm.externalNumberPool = extNumPool;
    }

    activate();
  }
})();
