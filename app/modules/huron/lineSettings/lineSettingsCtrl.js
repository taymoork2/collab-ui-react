(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LineSettingsCtrl', LineSettingsCtrl);

  /* @ngInject */
  function LineSettingsCtrl($scope, $state, $stateParams, $translate, $q, Log, Notification, DirectoryNumber, TelephonyInfoService, LineSettings, HuronAssignedLine) {
    $scope.cbAddText = $translate.instant('callForwardPanel.addNew');
    $scope.forward = 'busy';
    $scope.forwardAllCalls = '';
    $scope.forwardBusyCalls = '';
    $scope.forwardNoAnswerCalls = '';
    $scope.forwardExternalBusyCalls = '';
    $scope.forwardExternalNoAnswerCalls = '';
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
          $scope.internalNumberPool.push(internalNumber);
          $scope.assignedInternalNumber = internalNumber;

          initCallForward();
          initCallerId();
        });

        if (typeof $scope.telephonyInfo.alternateDirectoryNumber.uuid !== 'undefined' && $scope.telephonyInfo.alternateDirectoryNumber.uuid !== '') {
          $scope.assignedExternalNumber = $scope.telephonyInfo.alternateDirectoryNumber;
          $scope.externalNumberPool.push($scope.telephonyInfo.alternateDirectoryNumber);
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
    }

    function saveLineSettings() {
      processCallerId();
      processCallForward();

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
            TelephonyInfoService.getUserDnInfo($scope.currentUser.id);
            Notification.notify([$translate.instant('directoryNumberPanel.success')], 'success');
          })
          .catch(function (response) {
            Log.debug('saveLineSettings failed.  Status: ' + response.status + ' Response: ' + response.data);
            Notification.notify([$translate.instant('directoryNumberPanel.error')], 'error');
          });

      } else { // new line
        LineSettings.addNewLine($scope.currentUser.id, getDnUsage(), $scope.assignedInternalNumber.pattern, $scope.directoryNumber, $scope.assignedExternalNumber)
          .then(function (response) {
            $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
            $scope.directoryNumber.uuid = $scope.telephonyInfo.currentDirectoryNumber.uuid;
            $scope.directoryNumber.pattern = $scope.telephonyInfo.currentDirectoryNumber.pattern;
            TelephonyInfoService.getUserDnInfo($scope.currentUser.id);
            Notification.notify([$translate.instant('directoryNumberPanel.success')], 'success');
            $state.go('users.list.preview.directorynumber', {
              directoryNumber: $scope.directoryNumber.uuid
            });
          })
          .catch(function (response) {
            Log.debug('addNewLine failed.  Status: ' + response.status + ' Response: ' + response.data);
            Notification.notify([$translate.instant('directoryNumberPanel.error')], 'error');
          });
      }
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
      if ($scope.directoryNumber.callForwardAll.voicemailEnabled === 'true' || $scope.directoryNumber.callForwardAll.destination !== '') {
        $scope.forward = 'all';
      } else {
        if ($scope.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'true' || $scope.directoryNumber.callForwardBusy.destination !== '') {
          $scope.forward = 'busy';
          if (($scope.directoryNumber.callForwardBusy.voicemailEnabled !== $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled) || ($scope.directoryNumber.callForwardNoAnswer.voicemailEnabled !== $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled) || ($scope.directoryNumber.callForwardBusy.destination !== $scope.directoryNumber.callForwardBusy.intDestination) || ($scope.directoryNumber.callForwardNoAnswer.destination !== $scope.directoryNumber.callForwardNoAnswer.intDestination)) {
            $scope.forwardExternalCalls = true;
          }
        }
      }

      if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardAll.voicemailEnabled === 'true')) {
        $scope.forwardAllCalls = 'Voicemail';
      } else {
        if (($scope.telephonyInfo.voicemail === 'On') && $scope.directoryNumber.callForwardAll.destination !== '') {
          $scope.forwardAllCalls = 'Voicemail';
        } else {
          $scope.forwardAllCalls = $scope.directoryNumber.callForwardAll.destination;
        }
      }

      if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'true')) {
        $scope.forwardBusyCalls = 'Voicemail';
      } else if (($scope.telephonyInfo.voicemail === 'On') && ($scope.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
        $scope.forwardBusyCalls = 'Voicemail';
      } else {
        $scope.forwardBusyCalls = $scope.directoryNumber.callForwardBusy.intDestination;
      }

      if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardAll.voicemailEnabled === 'true')) {
        $scope.forwardAllCalls = 'Voicemail';
      } else {
        $scope.forwardAllCalls = $scope.directoryNumber.callForwardAll.destination;
      }

      if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'true')) {
        $scope.forwardNoAnswerCalls = 'Voicemail';
      } else if (($scope.telephonyInfo.voicemail === 'On') && ($scope.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
        $scope.forwardNoAnswerCalls = 'Voicemail';
      } else {
        $scope.forwardNoAnswerCalls = $scope.directoryNumber.callForwardNoAnswer.intDestination;
      }

      if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'true')) {
        $scope.forwardExternalNoAnswerCalls = 'Voicemail';
      } else if (($scope.telephonyInfo.voicemail === 'On') && ($scope.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
        $scope.forwardExternalNoAnswerCalls = 'Voicemail';
      } else {
        $scope.forwardExternalNoAnswerCalls = $scope.directoryNumber.callForwardNoAnswer.destination;
      }
    }

    function processCallForward() {
      if ($scope.forward === 'all') {
        if ($scope.forwardAllCalls === 'Voicemail') {
          $scope.directoryNumber.callForwardAll.voicemailEnabled = true;
        } else {
          $scope.directoryNumber.callForwardAll.voicemailEnabled = false;
          $scope.directoryNumber.callForwardAll.destination = $scope.forwardAllCalls;
        }
      } else {
        $scope.directoryNumber.callForwardAll.voicemailEnabled = false;
        $scope.directoryNumber.callForwardAll.destination = '';
        if ($scope.forwardExternalCalls) {
          if ($scope.forwardBusyCalls === 'Voicemail') {
            $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = true;
          } else {
            $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardBusy.intDestination = $scope.forwardBusyCalls;
            $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardNotRegistered.intDestination = $scope.forwardBusyCalls;
          }
          if ($scope.forwardNoAnswerCalls === 'Voicemail') {
            $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = true;
          } else {
            $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardNoAnswer.intDestination = $scope.forwardNoAnswerCalls;
          }
          if ($scope.forwardExternalBusyCalls === 'Voicemail') {
            $scope.directoryNumber.callForwardBusy.voicemailEnabled = true;
            $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = true;
          } else {
            $scope.directoryNumber.callForwardBusy.voicemailEnabled = false;
            $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
            $scope.directoryNumber.callForwardBusy.destination = $scope.forwardExternalBusyCalls;
            $scope.directoryNumber.callForwardNotRegistered.destination = $scope.forwardExternalBusyCalls;
          }
          if ($scope.forwardExternalNoAnswerCalls === 'Voicemail') {
            $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = true;
          } else {
            $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
            $scope.directoryNumber.callForwardNoAnswer.destination = $scope.forwardExternalNoAnswerCalls;
          }
        } else {
          if ($scope.forwardBusyCalls === 'Voicemail') {
            $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardBusy.voicemailEnabled = true;
            $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = true;
            $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = true;
            $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = true;
          } else {
            $scope.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
            $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardBusy.voicemailEnabled = false;
            $scope.directoryNumber.callForwardBusy.intDestination = $scope.forwardBusyCalls;
            $scope.directoryNumber.callForwardBusy.destination = $scope.forwardBusyCalls;

            $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
            $scope.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
            $scope.directoryNumber.callForwardNoAnswer.intDestination = $scope.forwardNoAnswerCalls;
            $scope.directoryNumber.callForwardNoAnswer.destination = $scope.forwardNoAnswerCalls;
            $scope.directoryNumber.callForwardNotRegistered.intDestination = $scope.forwardBusyCalls;
            $scope.directoryNumber.callForwardNotRegistered.destination = $scope.forwardNoAnswerCalls;
          }
        }
      }
    };

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
