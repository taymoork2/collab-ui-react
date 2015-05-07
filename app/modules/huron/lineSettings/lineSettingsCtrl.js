(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LineSettingsCtrl', LineSettingsCtrl);

  /* @ngInject */
  function LineSettingsCtrl($scope, $rootScope, $state, $stateParams, $translate, $q, $modal, Notification, DirectoryNumber, TelephonyInfoService, LineSettings, HuronAssignedLine, HuronUser, HttpUtils, ServiceSetup, UserListService, SharedLineInfoService) {
    var vm = this;
    vm.currentUser = $stateParams.currentUser;
    vm.entitlements = $stateParams.entitlements;
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

    vm.placeholder = $translate.instant('directoryNumberPanel.chooseNumber');
    vm.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');
    vm.nonePlaceholder = $translate.instant('directoryNumberPanel.none');

    vm.loadInternalNumberPool = loadInternalNumberPool;
    vm.loadExternalNumberPool = loadExternalNumberPool;
    vm.saveDisabled = saveDisabled;

    // SharedLine Info ---
    vm.sharedLineBtn = false;
    vm.selected = undefined;
    vm.users = [];
    vm.selectedUsers = [];
    vm.sharedLineEndpoints = [];
    vm.devices = [];
    vm.sharedLineUsers = [];
    vm.oneAtATime = true;
    vm.maxLines = 5;
    vm.sort = {
      by: 'name',
      order: 'ascending',
      maxCount: 10000,
      startAt: 0
    };
    vm.disableTypeahead = true;
    // end SharedLine Info ---

    // Caller ID Radio Button Model

    var name = getUserName(vm.currentUser.name, vm.currentUser.userName);

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

    vm.isSingleDevice = isSingleDevice;
    vm.saveLineSettings = saveLineSettings;
    vm.deleteLineSettings = deleteLineSettings;
    vm.resetLineSettings = resetLineSettings;
    vm.initNewForm = initNewForm;
    vm.init = init;

    vm.disassociateSharedLineUser = disassociateSharedLineUser;
    ////////////

    $scope.$on('SharedLineInfoUpdated', function () {
      vm.sharedLineEndpoints = SharedLineInfoService.getSharedLineDevices();
      vm.devices = angular.copy(vm.sharedLineEndpoints);
    });

    function initNewForm() {
      if ($stateParams.directoryNumber === 'new' && vm.form) {
        vm.form.$setDirty();
      }
    }

    function resetForm() {
      if ($stateParams.directoryNumber === 'new') {
        $state.go('user-overview.communication');
      } else if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    $scope.$on('$stateChangeStart', function (event, toState) {
      if (vm.form.$dirty && toState.name === 'user-overview') {
        if (angular.isDefined(toState)) {
          event.preventDefault();
          $modal.open({
            templateUrl: 'modules/huron/lineSettings/confirmModal.tpl.html'
          }).result.then(function () {
            if (vm.form) {
              vm.form.$setPristine();
              vm.form.$setUntouched();
            }
            $state.go(toState);
          });
        }
      }
    });

    function resetLineSettings() {
      init();
      resetForm();
    }

    function loadInternalNumberPool(pattern) {
      TelephonyInfoService.loadInternalNumberPool(pattern).then(function (internalNumberPool) {
        vm.internalNumberPool = internalNumberPool;
      }).catch(function (response) {
        vm.internalNumberPool = [];
        Notification.errorResponse(response, 'directoryNumberPanel.internalNumberPoolError');
      });
    }

    function loadExternalNumberPool(pattern) {
      TelephonyInfoService.loadExternalNumberPool(pattern).then(function (externalNumberPool) {
        vm.externalNumberPool = externalNumberPool;
      }).catch(function (response) {
        vm.externalNumberPool = [];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
      });
    }

    function init() {
      var directoryNumber = $stateParams.directoryNumber;
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
            }).catch(function (response) {
              vm.internalNumberPool = [];
              Notification.errorResponse(response, 'directoryNumberPanel.internalNumberPoolError');
            });
          }

          initCallForward();
          initCallerId();
        });

        if (typeof vm.telephonyInfo.alternateDirectoryNumber.uuid !== 'undefined' && vm.telephonyInfo.alternateDirectoryNumber.uuid !== '') {
          vm.assignedExternalNumber = vm.telephonyInfo.alternateDirectoryNumber;

          if (vm.externalNumberPool.length === 0) {
            TelephonyInfoService.loadExternalNumberPool().then(function (externalNumberPool) {
              vm.externalNumberPool = externalNumberPool;
            }).catch(function (response) {
              vm.externalNumberPool = [];
              Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
            });
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

      if (directoryNumber.uuid && directoryNumber.uuid !== "") {
        // line exists
        listSharedLineUsers(directoryNumber.uuid);
      }

      getUserList();

    }

    function initDirectoryNumber(directoryNumber) {
      if (directoryNumber === 'new') {
        TelephonyInfoService.updateCurrentDirectoryNumber('new');
        TelephonyInfoService.updateAlternateDirectoryNumber('none');
      } else {
        // update alternate number first
        if (typeof directoryNumber.altDnUuid === 'undefined' || directoryNumber.altDnUuid === 'none') {
          directoryNumber.altDnUuid = '';
          directoryNumber.altDnPattern = '';
        }
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
            promise = processSharedLineUsers();
            promises.push(promise);

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
              } else if ((vm.telephonyInfo.alternateDirectoryNumber.uuid !== '' && vm.telephonyInfo.alternateDirectoryNumber.uuid !== 'none') && vm.assignedExternalNumber.uuid !== 'none') { // changing external line
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
                if (vm.telephonyInfo.currentDirectoryNumber.dnUsage === 'Primary' && vm.telephonyInfo.services.indexOf('VOICEMAIL') !== -1) {
                  var dtmfAccessId = vm.telephonyInfo.alternateDirectoryNumber.pattern ? vm.telephonyInfo.alternateDirectoryNumber.pattern : vm.telephonyInfo.currentDirectoryNumber.pattern;
                  return HuronUser.updateDtmfAccessId(vm.currentUser.id, dtmfAccessId);
                }
              })
              .then(function () {
                TelephonyInfoService.getUserDnInfo(vm.currentUser.id)
                  .then(function () {
                    if (vm.telephonyInfo.currentDirectoryNumber.userDnUuid === "none") {
                      TelephonyInfoService.resetCurrentUser(vm.telephonyInfo.currentDirectoryNumber.uuid);
                      vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                    }
                  });
                listSharedLineUsers(vm.directoryNumber.uuid);
                Notification.notify([$translate.instant('directoryNumberPanel.success')], 'success');
                resetForm();
              })
              .catch(function (response) {
                listSharedLineUsers(vm.directoryNumber.uuid);
                Notification.errorResponse(response, 'directoryNumberPanel.error');
              });

          } else { // new line
            SharedLineInfoService.getUserLineCount(vm.currentUser.id)
              .then(function (totalLines) {
                if (totalLines < vm.maxLines) {
                  return LineSettings.addNewLine(vm.currentUser.id, getDnUsage(), vm.assignedInternalNumber.pattern, vm.directoryNumber, vm.assignedExternalNumber)
                    .then(function () {
                      return TelephonyInfoService.getUserDnInfo(vm.currentUser.id)
                        .then(function () {
                          vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                          vm.directoryNumber.uuid = vm.telephonyInfo.currentDirectoryNumber.uuid;
                          vm.directoryNumber.pattern = vm.telephonyInfo.currentDirectoryNumber.pattern;
                          vm.directoryNumber.altDnUuid = vm.telephonyInfo.alternateDirectoryNumber.uuid;
                          vm.directoryNumber.altDnPattern = vm.telephonyInfo.alternateDirectoryNumber.pattern;
                        }).then(function () {
                          return processSharedLineUsers();
                        }).then(function () {
                          Notification.notify([$translate.instant('directoryNumberPanel.success')], 'success');
                          $state.go('user-overview.communication.directorynumber', {
                            directoryNumber: vm.directoryNumber
                          });

                        });
                    });
                } else {
                  Notification.notify([$translate.instant('directoryNumberPanel.maxLines', {
                    user: name
                  })], 'error');
                  $state.go('user-overview.communication');

                }
              })
              .catch(function (response) {
                Notification.errorResponse(response, 'directoryNumberPanel.error');
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
          if (vm.telephonyInfo.currentDirectoryNumber.dnUsage != 'Primary') {
            return LineSettings.disassociateInternalLine(vm.currentUser.id, vm.telephonyInfo.currentDirectoryNumber.userDnUuid)
              .then(function () {
                TelephonyInfoService.getUserDnInfo(vm.currentUser.id);
                vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                Notification.notify([$translate.instant('directoryNumberPanel.disassociationSuccess')], 'success');
                $state.go('user-overview.communication');
              }).then(function () {
                return disassociateSharedLineUsers(true);
              })
              .catch(function (response) {
                Notification.errorResponse(response, 'directoryNumberPanel.error');
              });
          }
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
      if (vm.directoryNumber.hasCustomAlertingName === 'true') {
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
        vm.directoryNumber.hasCustomAlertingName = false;
      } else {
        vm.directoryNumber.alertingName = vm.callerIdInfo.otherName;
        vm.directoryNumber.hasCustomAlertingName = true;
      }
    }

    // Call Forward Radio Button Model
    function initCallForward() {
      if (vm.directoryNumber.callForwardAll.voicemailEnabled === 'true' || vm.directoryNumber.callForwardAll.destination !== null) {
        vm.forward = 'all';
      } else if ((vm.directoryNumber.callForwardAll.voicemailEnabled === 'false' && vm.directoryNumber.callForwardAll.destination === null && vm.directoryNumber.callForwardBusy.voicemailEnabled === 'false' && vm.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'false' && vm.directoryNumber.callForwardBusy.destination === null && vm.directoryNumber.callForwardBusy.intDestination === null && vm.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'false' && vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'false' && vm.directoryNumber.callForwardNoAnswer.destination === null && vm.directoryNumber.callForwardNoAnswer.intDestination === null) || (vm.telephonyInfo.voicemail !== 'On' && (vm.directoryNumber.callForwardBusy.intDestination === null || vm.directoryNumber.callForwardBusy.intDestination === undefined))) {
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

      vm.assignedExternalNumber = externalNumber;
      vm.externalNumberPool = extNumPool;
    }

    // Sharedline starts from here........
    function getUserList() {

      $rootScope.searchStr = '';

      //get all Users to search on

      UserListService.listUsers(vm.sort.startAt, vm.sort.maxCount, vm.sort.by, vm.sort.order, function (data, status) {
        if (data.success) {
          vm.users = data.Resources;
          vm.disableTypeahead = false;
        }
      });
    }

    vm.selectSharedLineUser = function ($item) {
      var userInfo = {
        'uuid': $item.id,
        'name': getUserName($item.name, $item.userName),
        'userName': $item.userName,
        'userDnUuid': 'none',
        'entitlements': $item.entitlements
      };

      vm.selected = undefined;

      if (isValidSharedLineUser(userInfo)) {
        vm.selectedUsers.push(userInfo);
        vm.sharedLineUsers.push(userInfo);
      }
    };

    function isValidSharedLineUser(userInfo) {
      var isVoiceUser = false;
      var isValidUser = true;

      angular.forEach(userInfo.entitlements, function (e) {
        if (e === 'ciscouc') {
          isVoiceUser = true;
        }
      });

      if (!isVoiceUser || userInfo.uuid == vm.currentUser.id) {
        // Exclude users without Voice service to be shared line User
        // Exclude current user
        if (!isVoiceUser) {
          Notification.notify([$translate.instant('sharedLinePanel.invalidUser', {
            user: userInfo.name
          })], 'error');
        }
        isValidUser = false;
      }
      if (isValidUser) {
        // Exclude selection of already selected users
        angular.forEach(vm.selectedUsers, function (user) {
          if (user.uuid === userInfo.uuid) {
            isValidUser = false;
          }
        });
        if (isValidUser) {
          //Exclude current sharedLine users
          angular.forEach(vm.sharedLineUsers, function (user) {
            if (user.uuid === userInfo.uuid) {
              isValidUser = false;
            }
          });
        }
      }
      return isValidUser;
    }

    function addSharedLineUsers() {
      //Associate new Sharedline users
      var uuid, name;
      var promises = [];
      var promise;
      if (vm.selectedUsers) {
        angular.forEach(vm.selectedUsers, function (user) {
          promise = SharedLineInfoService.getUserLineCount(user.uuid)
            .then(function (totalLines) {
              if (totalLines < vm.maxLines) {
                return SharedLineInfoService.addSharedLineUser(user.uuid, vm.directoryNumber.uuid);
              } else {
                name = (user.name) ? user.name : user.userName;
                Notification.notify([$translate.instant('directoryNumberPanel.maxLines', {
                  user: name
                })], 'error');
              }
            })
            .catch(function (response) {
              name = (user.name) ? user.name : user.userName;
              Notification.errorResponse(response, 'directoryNumberPanel.userError', {
                user: name
              });
            });
          promises.push(promise);
        });
        vm.selectedUsers = [];
      }
      return $q.all(promises);
    }

    function listSharedLineUsers(dnUuid) {
      vm.sharedLineUsers = [];
      var promise = SharedLineInfoService.loadSharedLineUsers(dnUuid, vm.currentUser.id)
        .then(function (users) {
          vm.sharedLineUsers = users;
          vm.sharedLineBtn = (vm.sharedLineUsers) ? true : false;
          vm.sharedLineEndpoints = SharedLineInfoService.loadSharedLineUserDevices(dnUuid);
        });
      return promise;
    }

    function disassociateSharedLineUser(userInfo, batchDelete) {
      vm.selectedUsers = [];
      if (!batchDelete) {
        vm.confirmationDialogue = $translate.instant('sharedLinePanel.disassociateUser');
        $modal.open({
          templateUrl: 'modules/huron/sharedLine/disassociateSharedLineMember.tpl.html',
          scope: $scope
        }).result.then(function () {
          if (!removeLocal(userInfo.uuid) && userInfo.dnUsage !== 'Primary') {
            return SharedLineInfoService.disassociateSharedLineUser(userInfo.uuid, userInfo.userDnUuid, vm.directoryNumber.uuid)
              .then(function () {
                if (vm.currentUser.id == userInfo.uuid) {
                  $state.go('user-overview.communication', {
                    reloadToggle: !$stateParams.reloadToggle
                  });
                } else {
                  return listSharedLineUsers(vm.directoryNumber.uuid);
                }
              });
          }
        });
      } else {
        return SharedLineInfoService.disassociateSharedLineUser(userInfo.uuid, userInfo.userDnUuid, vm.directoryNumber.uuid)
          .then(function () {
            return listSharedLineUsers(vm.directoryNumber.uuid);
          });
      }
    }

    function removeLocal(userUuid) {
      var isRemoveLocal = false;
      angular.forEach(vm.selectedUsers, function (user, index) {
        if (userUuid === user.uuid) {
          isRemoveLocal = true;
          vm.selectedUsers.splice(index, 1);
        }
      });
      if (isRemoveLocal) {
        angular.forEach(vm.sharedLineUsers, function (user, index) {
          if (userUuid === user.uuid) {
            vm.sharedLineUsers.splice(index, 1);
          }
        });
      }
      return isRemoveLocal;
    }

    function disassociateSharedLineUsers(deleteLineSettings) {
      var promise;
      var promises = [];
      if (vm.sharedLineUsers && vm.sharedLineUsers.length > 1 && deleteLineSettings) {
        //Disassociate SharedLine user on toggle/delete line
        angular.forEach(vm.sharedLineUsers, function (user) {
          if (user.dnUsage !== 'Primary' && user.uuid !== vm.currentUser.id && user.dnUuid === vm.directoryNumber.uuid) {
            promise = disassociateSharedLineUser(user, true);
            promises.push(promise);
          }
        });
      }
      return $q.all(promises);
    }

    function updateSharedLineDevices() {
      var promise;
      var promises = [];
      if (vm.sharedLineBtn === true && vm.sharedLineEndpoints) {
        for (var i = 0; i < vm.sharedLineEndpoints.length; i++) {
          //Update any device associated with SharedLine Users if any change.
          //Check/Uncheck Device association with line
          var curDevice = vm.devices[i];
          var changedDevice = vm.sharedLineEndpoints[i];
          if (curDevice && curDevice.isSharedLine != changedDevice.isSharedLine) {
            if (changedDevice.isSharedLine) {
              promise = SharedLineInfoService.associateLineEndpoint(changedDevice.uuid, vm.directoryNumber.uuid, changedDevice.maxIndex);
            } else {
              promise = SharedLineInfoService.disassociateLineEndpoint(changedDevice.uuid, vm.directoryNumber.uuid, changedDevice.endpointDnUuid);
            }
            promises.push(promise);
          }
        }
      }
      return $q.all(promises);
    }

    function processSharedLineUsers() {
      //This handles Shared Line Endpoint Association/Disassociation
      var promise;
      var promises = [];
      //Associate sharedline users if selected
      if (vm.selectedUsers) {
        promise = addSharedLineUsers();
        promises.push(promise);
      }
      if (vm.sharedLineUsers && vm.sharedLineUsers.length) {
        //Disassociate sharedline users if selected
        promise = disassociateSharedLineUsers(false);
        promises.push(promise);

        //Update Shared Line User devices if updated
        promise = updateSharedLineDevices();
        promises.push(promise);
      }
      return $q.all(promises);
    }

    function isSingleDevice(userDeviceList, userUuid) {
      var sharedCount = 0;
      var deviceCount = 0;

      angular.forEach(userDeviceList, function (device) {
        if (device.userUuid == userUuid) {
          deviceCount++;
          if (device.isSharedLine) {
            sharedCount++;
          }
        }
      });
      return (deviceCount == 1 && sharedCount == 1);
    }

    function getUserName(name, userId) {
      var userName = '';
      userName = (name && name.givenName) ? name.givenName : '';
      userName = (name && name.familyName) ? (userName + ' ' + name.familyName).trim() : userName;
      userName = (userName) ? userName : userId;
      return userName;
    }

    function saveDisabled() {
      if ((vm.internalNumberPool.length === 0 || vm.externalNumberPool.length === 0) && (vm.assignedInternalNumber.uuid === 'none' || vm.assignedExternalNumber.uuid === 'none')) {
        return true;
      }
      return false;
    }

    init();
  }
})();
