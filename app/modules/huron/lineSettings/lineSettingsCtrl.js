'use strict';

angular.module('Huron')
  .controller('LineSettingsCtrl', ['$scope', '$state', '$filter', 'DirectoryNumber', 'TelephonyInfoService',
    function ($scope, $state, $filter, DirectoryNumber, TelephonyInfoService) {
      $scope.cbAddText = $filter('translate')('callForwardPanel.addNew');
      $scope.forward = 'busy';
      $scope.forwardAllCalls = '';
      $scope.forwardBusyCalls = '';
      $scope.forwardNoAnswerCalls = '';
      $scope.forwardExternalBusyCalls = '';
      $scope.forwardExternalNoAnswerCalls = '';
      $scope.forwardExternalCalls = false;
      $scope.forwardOptions = [];
      $scope.validForwardOptions = [];

      $scope.directoryNumber = DirectoryNumber.getNewDirectoryNumber();

      var init = function () {
        $scope.telephonyInfo = TelephonyInfoService.getTelephonyInfo();

        if ($scope.telephonyInfo.voicemail === 'On') {
          if (!_.contains($scope.validForwardOptions, 'Voicemail')) {
            $scope.validForwardOptions.push('Voicemail');
          }
        }

        if (typeof $scope.telephonyInfo.currentDirectoryNumber !== 'undefined' && $scope.telephonyInfo.currentDirectoryNumber !== 'new') {
          DirectoryNumber.getDirectoryNumber($scope.telephonyInfo.currentDirectoryNumber.uuid).then(function (dn) {
            $scope.directoryNumber = dn;
            initCallForward();
            initCallerId();
          });
        } else { // add new dn case
          initCallForward();
          initCallerId();
        }

        DirectoryNumber.getInternalNumberPool().then(function (internalNumberPool) {
          $scope.internalNumberPool = internalNumberPool;
        });

        DirectoryNumber.getExternalNumberPool().then(function (externalNumberPool) {
          $scope.externalNumberPool = externalNumberPool;
        });
      }

      $scope.$on('telephonyInfoUpdated', function () {
        init();
      });

      $scope.saveDirectoryNumber = function () {
        processCallerId();
        processCallForward();

        if (typeof $scope.directoryNumber.uuid !== 'undefined') {
          DirectoryNumber.updateDirectoryNumber($scope.directoryNumber);
        } else {
          // TODO: make magic happen
        }
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
        if ($scope.directoryNumber.callForwardAll.voicemailEnabled === 'true' || typeof $scope.directoryNumber.callForwardAll.destination !== 'undefined') {
          $scope.forward = 'all';
        } else {
          if ($scope.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'true' || typeof $scope.directoryNumber.callForwardBusy.destination !== 'undefined') {
            $scope.forward = 'busy';
            if (($scope.directoryNumber.callForwardBusy.voicemailEnabled !== $scope.directoryNumber.callForwardBusy.intVoiceMailEnabled) || ($scope.directoryNumber.callForwardNoAnswer.voicemailEnabled !== $scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled) || ($scope.directoryNumber.callForwardBusy.destination !== $scope.directoryNumber.callForwardBusy.intDestination) || ($scope.directoryNumber.callForwardNoAnswer.destination !== $scope.directoryNumber.callForwardNoAnswer.intDestination)) {
              $scope.forwardExternalCalls = true;
            }
          }
        }
        if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardAll.voicemailEnabled === 'true')) {
          $scope.forwardAllCalls = 'Voicemail';
        } else {
          if (($scope.telephonyInfo.voicemail === 'On') && typeof $scope.directoryNumber.callForwardAll.destination !== 'undefined') {
            $scope.forwardAllCalls = 'Voicemail';
          } else {
            $scope.forwardAllCalls = $scope.directoryNumber.callForwardAll.destination;
          }
        }
        if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'true')) {
          $scope.forwardBusyCalls = 'Voicemail';
        } else {
          $scope.forwardBusyCalls = $scope.directoryNumber.callForwardBusy.intDestination;
        }
        if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardBusy.voicemailEnabled === 'true')) {
          $scope.forwardExternalBusyCalls = 'Voicemail';
        } else {
          $scope.forwardExternalBusyCalls = $scope.directoryNumber.callForwardBusy.destination;
        }
        if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'true')) {
          $scope.forwardNoAnswerCalls = 'Voicemail';
        } else {
          $scope.forwardNoAnswerCalls = $scope.directoryNumber.callForwardNoAnswer.intDestination;
        }
        if (($scope.telephonyInfo.voicemail === 'On') && ($scope.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'true')) {
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

      // Called when controller loads.
      if ($state.includes('users.list.preview.adddirectorynumber')) { // add line
        TelephonyInfoService.updateCurrentDirectoryNumber('new');
      }

      init();
    }
  ]);
