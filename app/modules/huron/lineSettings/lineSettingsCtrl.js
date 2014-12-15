(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LineSettingsCtrl', ['$scope', '$state', '$stateParams', '$filter', 'Log', 'Notification', 'DirectoryNumber', 'TelephonyInfoService', 'LineSettings', 'HuronAssignedLine',
      function ($scope, $state, $stateParams, $filter, Log, Notification, DirectoryNumber, TelephonyInfoService, LineSettings, HuronAssignedLine) {
        $scope.cbAddText = $filter('translate')('callForwardPanel.addNew');
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

        var init = function () {
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

        $scope.saveLineSettings = function () {
          processCallerId();
          processCallForward();

          // this is some nasty logic
          if (typeof $scope.directoryNumber.uuid !== 'undefined' && $scope.directoryNumber.uuid !== '') { // internal line exists
            if ($scope.telephonyInfo.currentDirectoryNumber.uuid !== $scope.assignedInternalNumber.uuid) { // changing internal line
              LineSettings.changeInternalLine($scope.telephonyInfo.currentDirectoryNumber.uuid, $scope.assignedInternalNumber.uuid, $scope.currentUser.id, $scope.telephonyInfo.currentDirectoryNumber.dnUsage, $scope.assignedInternalNumber.pattern, $scope.directoryNumber, $scope.assignedExternalNumber)
                .then(function (response) {
                  $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                  $scope.directoryNumber.uuid = $scope.telephonyInfo.currentDirectoryNumber.uuid;
                  $scope.directoryNumber.pattern = $scope.telephonyInfo.currentDirectoryNumber.pattern;
                  TelephonyInfoService.getUserDnInfo($scope.currentUser.id);
                  Notification.notify([$filter('translate')('directoryNumberPanel.success')], 'success');
                  $state.go('users.list.preview.directorynumber', {
                    directoryNumber: $scope.directoryNumber.uuid
                  });
                })
                .catch(function (response) {
                  Log.debug('changeInternalLine failed.  Status: ' + response.status + ' Response: ' + response.data);
                  Notification.notify([$filter('translate')('directoryNumberPanel.error')], 'error');
                });
            } else if ($scope.telephonyInfo.alternateDirectoryNumber.uuid !== $scope.assignedExternalNumber.uuid) { // external line drop down has a value
              if (($scope.telephonyInfo.alternateDirectoryNumber.uuid === '' || $scope.telephonyInfo.alternateDirectoryNumber.uuid === 'none') && $scope.assignedExternalNumber.uuid !== 'none') { // no existing external line, add external line
                LineSettings.addExternalLine($scope.directoryNumber.uuid, $scope.currentUser.id, $scope.assignedExternalNumber.pattern, $scope.directoryNumber)
                  .then(function (response) {
                    processExternalNumberList();
                    Notification.notify([$filter('translate')('directoryNumberPanel.success')], 'success');
                  })
                  .catch(function (response) {
                    Log.debug('addExternalLine failed.  Status: ' + response.status + ' Response: ' + response.data);
                    Notification.notify([$filter('translate')('directoryNumberPanel.error')], 'error');
                  });
              } else if (($scope.telephonyInfo.alternateDirectoryNumber.uuid !== '' || $scope.telephonyInfo.alternateDirectoryNumber.uuid !== 'none') && $scope.assignedExternalNumber.uuid !== 'none') { // changing external line
                LineSettings.changeExternalLine($scope.directoryNumber.uuid, $scope.telephonyInfo.alternateDirectoryNumber.uuid, $scope.currentUser.id, $scope.assignedExternalNumber.pattern, $scope.directoryNumber)
                  .then(function (response) {
                    processExternalNumberList();
                    Notification.notify([$filter('translate')('directoryNumberPanel.success')], 'success');
                  })
                  .catch(function (response) {
                    Log.debug('changeExternalLine failed.  Status: ' + response.status + ' Response: ' + response.data);
                    Notification.notify([$filter('translate')('directoryNumberPanel.error')], 'error');
                  });
              } else if ($scope.telephonyInfo.alternateDirectoryNumber.uuid !== '' && $scope.assignedExternalNumber.uuid === 'none') {
                LineSettings.deleteExternalLine($scope.directoryNumber.uuid, $scope.telephonyInfo.alternateDirectoryNumber.uuid, $scope.currentUser.id, $scope.directoryNumber)
                  .then(function (response) {
                    processExternalNumberList();
                    Notification.notify([$filter('translate')('directoryNumberPanel.success')], 'success');
                  })
                  .catch(function (response) {
                    Log.debug('deleteExternalLine failed.  Status: ' + response.status + ' Response: ' + response.data);
                    Notification.notify([$filter('translate')('directoryNumberPanel.error')], 'error');
                  });
              } else { // not changing external line, just update line setttings
                LineSettings.updateLineSettings($scope.directoryNumber);
              }
            } else { // not changing internal line, just update line setttings
              LineSettings.updateLineSettings($scope.directoryNumber);
            }
          } else { // new internal line
            LineSettings.addInternalLine($scope.currentUser.id, getDnUsage(), $scope.assignedInternalNumber.pattern, $scope.directoryNumber, $scope.assignedExternalNumber)
              .then(function (response) {
                $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                $scope.directoryNumber.uuid = $scope.telephonyInfo.currentDirectoryNumber.uuid;
                $scope.directoryNumber.pattern = $scope.telephonyInfo.currentDirectoryNumber.pattern;
                TelephonyInfoService.getUserDnInfo($scope.currentUser.id);
                Notification.notify([$filter('translate')('directoryNumberPanel.success')], 'success');
                $state.go('users.list.preview.directorynumber', {
                  directoryNumber: $scope.directoryNumber.uuid
                });
              })
              .catch(function (response) {
                Log.debug('addInternalLine failed.  Status: ' + response.status + ' Response: ' + response.data);
                Notification.notify([$filter('translate')('directoryNumberPanel.error')], 'error');
              });
          }
        };

        // this is used to determine dnUsage for new internal lines
        var getDnUsage = function () {
          var dnUsage = 'Undefined';
          if ($scope.telephonyInfo.directoryNumbers.length === 0) {
            dnUsage = 'Primary';
          }
          return dnUsage;
        };

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

        var initCallerId = function () {
          if ($scope.directoryNumber.alertingName !== $scope.callerIdInfo.default && $scope.directoryNumber.alertingName !== '') {
            $scope.callerIdInfo.otherName = $scope.directoryNumber.alertingName;
            $scope.callerIdInfo.selection = 'other';
          } else {
            $scope.callerIdInfo.selection = 'default';
            $scope.callerIdInfo.otherName = null;
          }
        }

        var processCallerId = function () {
          if ($scope.callerIdInfo.selection === 'default') {
            $scope.directoryNumber.alertingName = $scope.callerIdInfo.default;
          } else {
            $scope.directoryNumber.alertingName = $scope.callerIdInfo.otherName;
          }
        }

        // Call Forward Radio Button Model
        var initCallForward = function () {
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

          if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardBusy.voicemailEnabled === 'true')) {
            $scope.forwardExternalBusyCalls = 'Voicemail';
          } else if (($scope.telephonyInfo.voicemail === 'On') && ($scope.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
            $scope.forwardExternalBusyCalls = 'Voicemail';
          } else {
            $scope.forwardExternalBusyCalls = $scope.directoryNumber.callForwardBusy.destination;
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

        var processCallForward = function () {
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

        var processInternalNumberList = function () {
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

        var processExternalNumberList = function () {
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

        init();
        // End called when controller loads.
      }
    ]);
})();
