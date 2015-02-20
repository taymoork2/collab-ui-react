(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LineSettingsCtrl', LineSettingsCtrl);

  /* @ngInject */
  function LineSettingsCtrl($scope, $state, $stateParams, $translate, $q, $modal, Log, Notification, DirectoryNumber, TelephonyInfoService, LineSettings, HuronAssignedLine, HttpUtils) {
    $scope.cbAddText = $translate.instant('callForwardPanel.addNew');
    $scope.title = $translate.instant('directoryNumberPanel.title');
    $scope.removeNumber = $translate.instant('directoryNumberPanel.removeNumber');
    $scope.forward = 'busy';
    $scope.forwardAllCalls = '';
    $scope.forwardNABCalls = '';
    $scope.forwardExternalNABCalls = '';
    $scope.validForwardOptions = [];
    $scope.directoryNumber = DirectoryNumber.getNewDirectoryNumber();
    $scope.internalNumberPool = [];
    $scope.externalNumberPool = [];

    // Caller ID Radio Button Model
    var name;
    if ($scope.currentUser.name) {
      name = ($scope.currentUser.name.givenName + ' ' + $scope.currentUser.name.familyName).trim();
    } else {
      name = $scope.currentUser.userName;
    }
    $scope.callerIdInfo = {
      'default': name,
      'otherName': null,
      'selection': 'default'
    };

    $scope.saveLineSettings = saveLineSettings;
    $scope.additionalBtnClick = deleteLineSettings;
    $scope.additionalBtn = {
      label: 'directoryNumberPanel.removeNumber',
      btnclass: 'btn btn-default btn-remove',
      id: 'btn-remove'
    };
    init();

    function init() {
      var directoryNumber = $stateParams.directoryNumber;
      if (directoryNumber) {
        if (directoryNumber === 'new') {
          TelephonyInfoService.updateCurrentDirectoryNumber('new');
        }
      }

      $scope.assignedInternalNumber = {
        uuid: 'none',
        pattern: ''
      };
      $scope.assignedExternalNumber = {
        uuid: 'none',
        pattern: 'None'
      };
      $scope.forwardExternalCalls = false;
      $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
      $scope.internalNumberPool = TelephonyInfoService.getInternalNumberPool();
      $scope.externalNumberPool = TelephonyInfoService.getExternalNumberPool();

      if ($scope.telephonyInfo.voicemail === 'On') {
        if (!_.contains($scope.validForwardOptions, 'Voicemail')) {
          $scope.validForwardOptions.push('Voicemail');
        }
      }

      if (typeof $scope.telephonyInfo.currentDirectoryNumber.uuid !== 'undefined' && $scope.telephonyInfo.currentDirectoryNumber.uuid !== 'new') {
        DirectoryNumber.getDirectoryNumber($scope.telephonyInfo.currentDirectoryNumber.uuid).then(function (dn) {
          var internalNumber = {
            'uuid': dn.uuid,
            'pattern': dn.pattern
          };

          $scope.directoryNumber = dn;
          $scope.assignedInternalNumber = internalNumber;

          $scope.internalNumberPool = TelephonyInfoService.getInternalNumberPool();
          if ($scope.internalNumberPool.length === 0) {
            TelephonyInfoService.loadInternalNumberPool().then(function (internalNumberPool) {
              $scope.internalNumberPool = internalNumberPool;
              $scope.internalNumberPool.push(internalNumber);
            });
          } else {
            $scope.internalNumberPool.push(internalNumber);
          }

          initCallForward();
          initCallerId();
        });

        if (typeof $scope.telephonyInfo.alternateDirectoryNumber.uuid !== 'undefined' && $scope.telephonyInfo.alternateDirectoryNumber.uuid !== '') {
          $scope.assignedExternalNumber = $scope.telephonyInfo.alternateDirectoryNumber;

          if ($scope.externalNumberPool.length === 0) {
            TelephonyInfoService.loadExternalNumberPool().then(function (externalNumberPool) {
              $scope.externalNumberPool = externalNumberPool;
              $scope.externalNumberPool.push($scope.telephonyInfo.alternateDirectoryNumber);
            });
          } else {
            $scope.externalNumberPool.push($scope.telephonyInfo.alternateDirectoryNumber);
          }
        }

      } else { // add new dn case
        HuronAssignedLine.getUnassignedDirectoryNumber().then(function (dn) {
          if (typeof dn !== 'undefined') {
            var internalNumber = {
              'uuid': dn.uuid,
              'pattern': dn.pattern
            };
            $scope.assignedInternalNumber = internalNumber;
          }
        });
        initCallForward();
        initCallerId();
      }

      if (($scope.telephonyInfo.currentDirectoryNumber.dnUsage !== 'Primary') && ($scope.telephonyInfo.currentDirectoryNumber.uuid !== 'new')) {
        // Can't remove primary line
        $scope.additionalBtn.show = true;

        if ($scope.telephonyInfo.currentDirectoryNumber.userDnUuid === "none") {
          TelephonyInfoService.resetCurrentUser($scope.telephonyInfo.currentDirectoryNumber.uuid);
          $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
        }
      }
    }

    function saveLineSettings() {
      HttpUtils.setTrackingID().then(function () {
        processCallerId();
        var callForwardSet = processCallForward();

        if (callForwardSet === true) {
          if (typeof $scope.directoryNumber.uuid !== 'undefined' && $scope.directoryNumber.uuid !== '') { // line exists
            var promises = [];
            if ($scope.telephonyInfo.currentDirectoryNumber.uuid !== $scope.assignedInternalNumber.uuid) { // internal line
              var promise = LineSettings.changeInternalLine($scope.telephonyInfo.currentDirectoryNumber.uuid, $scope.telephonyInfo.currentDirectoryNumber.dnUsage, $scope.assignedInternalNumber.pattern, $scope.directoryNumber)
                .then(function (response) {
                  $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                  $scope.directoryNumber.uuid = $scope.telephonyInfo.currentDirectoryNumber.uuid;
                  $scope.directoryNumber.pattern = $scope.telephonyInfo.currentDirectoryNumber.pattern;
                  processInternalNumberList();
                });
              promises.push(promise);
            } else { // no line change, just update settings
              var promise = LineSettings.updateLineSettings($scope.directoryNumber);
              promises.push(promise);
            }

            if ($scope.telephonyInfo.alternateDirectoryNumber.uuid !== $scope.assignedExternalNumber.uuid) { // external line
              if (($scope.telephonyInfo.alternateDirectoryNumber.uuid === '' || $scope.telephonyInfo.alternateDirectoryNumber.uuid === 'none') && $scope.assignedExternalNumber.uuid !== 'none') { // no existing external line, add external line
                var promise = LineSettings.addExternalLine($scope.directoryNumber.uuid, $scope.assignedExternalNumber.pattern)
                  .then(function (response) {
                    processExternalNumberList();
                  });
                promises.push(promise);
              } else if (($scope.telephonyInfo.alternateDirectoryNumber.uuid !== '' || $scope.telephonyInfo.alternateDirectoryNumber.uuid !== 'none') && $scope.assignedExternalNumber.uuid !== 'none') { // changing external line
                var promise = LineSettings.changeExternalLine($scope.directoryNumber.uuid, $scope.telephonyInfo.alternateDirectoryNumber.uuid, $scope.assignedExternalNumber.pattern)
                  .then(function (response) {
                    processExternalNumberList();
                  });
                promises.push(promise);
              } else if ($scope.telephonyInfo.alternateDirectoryNumber.uuid !== '' && $scope.assignedExternalNumber.uuid === 'none') {
                var promise = LineSettings.deleteExternalLine($scope.directoryNumber.uuid, $scope.telephonyInfo.alternateDirectoryNumber.uuid)
                  .then(function (response) {
                    processExternalNumberList();
                  });
                promises.push(promise);
              }
            }

            $q.all(promises)
              .then(function () {
                TelephonyInfoService.getUserDnInfo($scope.currentUser.id)
                  .then(function () {
                    if ($scope.telephonyInfo.currentDirectoryNumber.userDnUuid === "none") {
                      TelephonyInfoService.resetCurrentUser($scope.telephonyInfo.currentDirectoryNumber.uuid);
                      $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                    }
                  });
                Notification.notify([$translate.instant('directoryNumberPanel.success')], 'success');
              })
              .catch(function (response) {
                Log.debug('saveLineSettings failed.  Status: ' + response.status + ' Response: ' + response.data);
                Notification.notify([$translate.instant('directoryNumberPanel.error')], 'error');
              });

          } else { // new line
            LineSettings.addNewLine($scope.currentUser.id, getDnUsage(), $scope.assignedInternalNumber.pattern, $scope.directoryNumber, $scope.assignedExternalNumber)
              .then(function (response) {
                return TelephonyInfoService.getUserDnInfo($scope.currentUser.id)
                  .then(function () {
                    $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                    $scope.directoryNumber.uuid = $scope.telephonyInfo.currentDirectoryNumber.uuid;
                    $scope.directoryNumber.pattern = $scope.telephonyInfo.currentDirectoryNumber.pattern;
                    Notification.notify([$translate.instant('directoryNumberPanel.success')], 'success');
                    $state.go('users.list.preview.directorynumber', {
                      directoryNumber: $scope.directoryNumber.uuid
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
    };

    function deleteLineSettings() {
      HttpUtils.setTrackingID().then(function () {
        // fill in the {{line}} and {{user}} for directoryNumberPanel.deleteConfirmation
        $scope.confirmationDialogue = $translate.instant('directoryNumberPanel.deleteConfirmation', {
          line: $scope.telephonyInfo.currentDirectoryNumber.pattern,
          user: $scope.callerIdInfo.default
        });

        $modal.open({
          templateUrl: 'modules/huron/lineSettings/deleteConfirmation.tpl.html',
          scope: $scope
        }).result.then(function () {
          return LineSettings.disassociateInternalLine($scope.currentUser.id, $scope.telephonyInfo.currentDirectoryNumber.userDnUuid)
            .then(function (response) {
              TelephonyInfoService.getUserDnInfo($scope.currentUser.id);
              $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
              Notification.notify([$translate.instant('directoryNumberPanel.disassociationSuccess')], 'success');
              $state.go('users.list.preview');
            })
            .catch(function (response) {
              Log.debug('disassociateInternalLine failed.  Status: ' + response.status + ' Response: ' + response.data);
              Notification.notify([$translate.instant('directoryNumberPanel.error')], 'error');
            });
        });
      });
    };

    // this is used to determine dnUsage for new internal lines
    function getDnUsage() {
      var dnUsage = 'Undefined';
      if ($scope.telephonyInfo.directoryNumbers.length === 0) {
        dnUsage = 'Primary';
      }
      return dnUsage;
    };

    function initCallerId() {
      if ($scope.directoryNumber.alertingName !== $scope.callerIdInfo.default && $scope.directoryNumber.alertingName !== '') {
        $scope.callerIdInfo.otherName = $scope.directoryNumber.alertingName;
        $scope.callerIdInfo.selection = 'other';
      } else {
        $scope.callerIdInfo.selection = 'default';
        $scope.callerIdInfo.otherName = null;
      }
    }

    function processCallerId() {
      if ($scope.callerIdInfo.selection === 'default') {
        $scope.directoryNumber.alertingName = $scope.callerIdInfo.default;
      } else {
        $scope.directoryNumber.alertingName = $scope.callerIdInfo.otherName;
      }
    }

    // Call Forward Radio Button Model
    function initCallForward() {
      if ($scope.directoryNumber.callForwardAll.voicemailEnabled === 'true' || $scope.directoryNumber.callForwardAll.destination !== null) {
        $scope.forward = 'all';
      } else if ($scope.directoryNumber.callForwardAll.voicemailEnabled === 'false' && $scope.directoryNumber.callForwardAll.destination === null && $scope.directoryNumber.callForwardBusy.voicemailEnabled === 'false' && $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'false' && $scope.directoryNumber.callForwardBusy.destination === null && $scope.directoryNumber.callForwardBusy.intDestination === null && $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'false' && $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'false' && $scope.directoryNumber.callForwardNoAnswer.destination === null && $scope.directoryNumber.callForwardNoAnswer.intDestination === null) {
        $scope.forward = 'none';
      } else {
        $scope.forward = 'busy';
        if ((($scope.directoryNumber.callForwardBusy.voicemailEnabled !== $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled) || ($scope.directoryNumber.callForwardNoAnswer.voicemailEnabled !== $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled)) && (($scope.directoryNumber.callForwardBusy.destination !== $scope.directoryNumber.callForwardBusy.intDestination) || ($scope.directoryNumber.callForwardNoAnswer.destination !== $scope.directoryNumber.callForwardNoAnswer.intDestination))) {
          $scope.forwardExternalCalls = true;
        }
      }

      if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardAll.voicemailEnabled === 'true')) {
        $scope.forwardAllCalls = 'Voicemail';
      } else {
        $scope.forwardAllCalls = $scope.directoryNumber.callForwardAll.destination;
      }

      if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'true' || $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'true' || $scope.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
        $scope.forwardNABCalls = 'Voicemail';
      } else {
        $scope.forwardNABCalls = $scope.directoryNumber.callForwardBusy.intDestination; //CallForwardNoAnswer is the same value, chose shorter variable name
      }

      if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardBusy.voicemailEnabled === 'true' || $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'true' || $scope.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
        $scope.forwardExternalNABCalls = 'Voicemail';
      } else {
        $scope.forwardExternalNABCalls = $scope.directoryNumber.callForwardBusy.destination;
      }
    }

    function processCallForward() {
      if ($scope.forward === 'all') {
        $scope.directoryNumber.callForwardBusy.voicemailEnabled = false;
        $scope.directoryNumber.callForwardBusy.destination = '';
        $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
        $scope.directoryNumber.callForwardBusy.intDestination = '';
        $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
        $scope.directoryNumber.callForwardNoAnswer.destination = '';
        $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
        $scope.directoryNumber.callForwardNoAnswer.intDestination = '';
        $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
        $scope.directoryNumber.callForwardNotRegistered.destination = '';
        $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
        $scope.directoryNumber.callForwardNotRegistered.intDestination = '';

        if ($scope.forwardAllCalls === 'Voicemail') {
          $scope.directoryNumber.callForwardAll.voicemailEnabled = true;
          $scope.directoryNumber.callForwardAll.destination = '';
        } else if ($scope.forwardAllCalls !== '') {
          $scope.directoryNumber.callForwardAll.voicemailEnabled = false;
          $scope.directoryNumber.callForwardAll.destination = $scope.forwardAllCalls;
        } else {
          return false;
        }
      } else if ($scope.forward === 'none') {
        $scope.directoryNumber.callForwardAll.voicemailEnabled = false;
        $scope.directoryNumber.callForwardAll.destination = '';
        $scope.directoryNumber.callForwardBusy.voicemailEnabled = false;
        $scope.directoryNumber.callForwardBusy.destination = '';
        $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
        $scope.directoryNumber.callForwardBusy.intDestination = '';
        $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
        $scope.directoryNumber.callForwardNoAnswer.destination = '';
        $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
        $scope.directoryNumber.callForwardNoAnswer.intDestination = '';
        $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
        $scope.directoryNumber.callForwardNotRegistered.destination = '';
        $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
        $scope.directoryNumber.callForwardNotRegistered.intDestination = '';
      } else {
        $scope.directoryNumber.callForwardAll.voicemailEnabled = false;
        $scope.directoryNumber.callForwardAll.destination = '';

        if ($scope.forwardExternalCalls) {

          if ($scope.forwardNABCalls === 'Voicemail') {
            $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardBusy.intDestination = '';
            $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardNoAnswer.intDestination = '';
            $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardNotRegistered.intDestination = '';
          } else if ($scope.forwardNABCalls !== '') {
            $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardBusy.intDestination = $scope.forwardNABCalls;
            $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardNoAnswer.intDestination = $scope.forwardNABCalls;
            $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardNotRegistered.intDestination = $scope.forwardNABCalls;
          } else {
            return false;
          }

          if ($scope.forwardExternalNABCalls === 'Voicemail') {
            $scope.directoryNumber.callForwardBusy.voicemailEnabled = true;
            $scope.directoryNumber.callForwardBusy.destination = '';
            $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = true;
            $scope.directoryNumber.callForwardNoAnswer.destination = '';
            $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = true;
            $scope.directoryNumber.callForwardNotRegistered.destination = '';
          } else if ($scope.forwardExternalNABCalls !== '') {
            $scope.directoryNumber.callForwardBusy.voicemailEnabled = false;
            $scope.directoryNumber.callForwardBusy.destination = $scope.forwardExternalNABCalls;
            $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
            $scope.directoryNumber.callForwardNoAnswer.destination = $scope.forwardExternalNABCalls;
            $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
            $scope.directoryNumber.callForwardNotRegistered.destination = $scope.forwardExternalNABCalls;
          } else {
            return false;
          }
        } else {
          if ($scope.forwardNABCalls === 'Voicemail') {
            $scope.directoryNumber.callForwardBusy.voicemailEnabled = true;
            $scope.directoryNumber.callForwardBusy.destination = '';
            $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardBusy.intDestination = '';
            $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = true;
            $scope.directoryNumber.callForwardNoAnswer.destination = '';
            $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardNoAnswer.intDestination = '';
            $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = true;
            $scope.directoryNumber.callForwardNotRegistered.destination = '';
            $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardNotRegistered.intDestination = '';
          } else if ($scope.forwardNABCalls !== '') {
            $scope.directoryNumber.callForwardBusy.voicemailEnabled = false;
            $scope.directoryNumber.callForwardBusy.destination = $scope.forwardNABCalls;
            $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardBusy.intDestination = $scope.forwardNABCalls;
            $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
            $scope.directoryNumber.callForwardNoAnswer.destination = $scope.forwardNABCalls;
            $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardNoAnswer.intDestination = $scope.forwardNABCalls;
            $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
            $scope.directoryNumber.callForwardNotRegistered.destination = $scope.forwardNABCalls;
            $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardNotRegistered.intDestination = $scope.forwardNABCalls;
          } else {
            return false;
          }
        }
      }

      return true;
    };

    //fucntion keeps voicemail the default in real time if it is on and no other desination has been set
    $scope.$watch('forward', function () {
      if ($scope.forward === 'all' && $scope.telephonyInfo.voicemail === 'On') {
        if ($scope.directoryNumber.callForwardAll.destination === null) {
          $scope.forwardAllCalls = 'Voicemail';
        } else {
          $scope.forwardAllCalls = $scope.directoryNumber.callForwardAll.destination;
        }
      } else if ($scope.forward === 'busy' && $scope.telephonyInfo.voicemail === 'On') {
        if ($scope.directoryNumber.callForwardBusy.destination === null || $scope.directoryNumber.callForwardNoAnswer.destination === null) {
          $scope.forwardNABCalls = 'Voicemail';
        } else {
          $scope.forwardNABCalls = $scope.directoryNumber.callForwardBusy.destination;
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

      $scope.assignedInternalNumber = internalNumber;
      $scope.internalNumberPool = intNumPool;
    };

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

      $scope.assignedExternalNumber = externalNumber;
      $scope.externalNumberPool = extNumPool;
    };
  }
})();
