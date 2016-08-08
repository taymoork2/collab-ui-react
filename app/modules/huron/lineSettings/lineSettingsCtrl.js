(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('LineSettingsCtrl', LineSettingsCtrl);

  /* @ngInject */
  function LineSettingsCtrl($scope, $state, $stateParams, $translate, $q, $modal, Notification, DirectoryNumber, TelephonyInfoService, LineSettings, HuronAssignedLine, HuronUser, UserListService, SharedLineInfoService, ValidationService, CallerId, DialPlanService) {
    var vm = this;

    vm.cfModel = {
      forward: 'busy',
      forwardExternalCalls: false,
      forwardExternalNABCalls: '',
      forwardAllCalls: '',
      forwardNABCalls: ''
    };

    vm.simultaneousModel = {
      incomingCallMaximum: 8
    };

    vm.multipleCalls = {
      incomingCallMaximum: 2
    };

    vm.validations = {
      phoneNumber: function (viewValue, modelValue) {
        var value = modelValue || viewValue;
        return /^(\+?)?[\d]{10,11}$/.test(value);
      }
    };

    vm.currentUser = $stateParams.currentUser;
    vm.entitlements = $stateParams.entitlements;
    vm.cbAddText = $translate.instant('callForwardPanel.addNew');
    vm.title = $translate.instant('directoryNumberPanel.title');
    vm.vmFwdMismatch = $translate.instant('callForwardPanel.forwardVoicemailDisabled');
    vm.internalNumberLabel = $translate.instant('directoryNumberPanel.internalNumberExtension');
    vm.validForwardOptions = [];
    vm.directoryNumber = DirectoryNumber.getNewDirectoryNumber();
    vm.internalNumberPool = [];
    vm.externalNumberPool = [];
    vm.showExtensions = true;

    vm.placeholder = $translate.instant('directoryNumberPanel.chooseNumber');
    vm.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');
    vm.nonePlaceholder = $translate.instant('directoryNumberPanel.none');

    vm.loadInternalNumberPool = loadInternalNumberPool;
    vm.loadExternalNumberPool = loadExternalNumberPool;
    vm.saveDisabled = saveDisabled;
    vm.callerIdOptions = [];
    vm.assignedExternalNumberChange = assignedExternalNumberChange;
    vm.checkDnOverlapsSteeringDigit = checkDnOverlapsSteeringDigit;
    vm.syncDidDn = syncDidDn;
    // The following are for externalCallerIdType in DB, no translation needed
    var directLine_type = 'Direct Line';
    var blockedCallerId_type = 'Blocked Outbound Caller ID';
    var companyCallerId_type = 'Company Caller ID';
    var companyNumber_type = 'Company Number';
    var customCallerId_type = 'Custom';
    var custom_label = $translate.instant('callerIdPanel.customCallerId');
    var directLine_label = $translate.instant('callerIdPanel.directLine');
    var blockedCallerId_label = $translate.instant('callerIdPanel.blockedCallerId');
    var companyCallerId_label = $translate.instant('callerIdPanel.companyCallerId');

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
      maxCount: 10,
      startAt: 0
    };
    // end SharedLine Info ---

    var name = getUserName(vm.currentUser.name, vm.currentUser.userName);

    vm.additionalBtn = {
      label: 'directoryNumberPanel.removeNumber',
      btnclass: 'btn btn-remove',
      id: 'btn-remove'
    };

    vm.isSingleDevice = isSingleDevice;
    vm.saveLineSettings = saveLineSettings;
    vm.deleteLineSettings = deleteLineSettings;
    vm.resetLineSettings = resetLineSettings;
    vm.initNewForm = initNewForm;
    vm.getUserList = getUserList;
    vm.init = init;

    // Flag to disable and add "loading" animation to Save button while line settings being saved
    vm.saveInProcess = false;

    vm.disassociateSharedLineUser = disassociateSharedLineUser;
    ////////////

    vm.callForwardingFields = [{
      key: 'forwardNoneRadio',
      type: 'radio',
      templateOptions: {
        label: $translate.instant('callForwardPanel.forwardNoCalls'),
        value: 'none',
        model: 'forward'
      }
    }, {
      key: 'forwardAllRadio',
      type: 'radio',
      templateOptions: {
        label: $translate.instant('callForwardPanel.forwardAllCalls'),
        value: 'all',
        model: 'forward'
      }
    }, {
      key: 'forwardAllCalls',
      type: 'select',
      templateOptions: {
        combo: true,
        options: vm.validForwardOptions,
        required: true,
        maxlength: 50
      },
      validators: {
        callForward: {
          expression: ValidationService.callForward,
          message: function () {
            return $translate.instant('validation.callForward');
          }
        }
      },
      hideExpression: function ($viewValue, $modelValue, scope) {
        return scope.model.forward !== 'all';
      }
    }, {
      key: 'forwardBusyRadio',
      type: 'radio',
      templateOptions: {
        label: $translate.instant('callForwardPanel.forwardBusyNoAnswer'),
        value: 'busy',
        model: 'forward'
      }
    }, {
      key: 'forwardNABCalls',
      type: 'select',
      templateOptions: {
        combo: true,
        options: vm.validForwardOptions,
        required: true,
        maxlength: 50,
        label: $translate.instant('callForwardPanel.internalAndExternal')
      },
      validators: {
        callForward: {
          expression: ValidationService.callForward,
          message: function () {
            return $translate.instant('validation.callForward');
          }
        }
      },
      hideExpression: function ($viewValue, $modelValue, scope) {
        return scope.model.forward !== 'busy';
      },
      expressionProperties: {
        'templateOptions.label': function ($viewValue, $modelValue, scope) {
          return scope.model.forwardExternalCalls ? $translate.instant('callForwardPanel.internalOnly') : $translate.instant('callForwardPanel.internalAndExternal');
        }
      }
    }, {
      key: 'forwardExternalCalls',
      type: 'checkbox',
      templateOptions: {
        label: $translate.instant('callForwardPanel.forwardExternal'),
        id: 'ckForwardExternalCalls'
      },
      hideExpression: function ($viewValue, $modelValue, scope) {
        return scope.model.forward !== 'busy';
      }
    }, {
      key: 'forwardExternalNABCalls',
      type: 'select',
      templateOptions: {
        combo: true,
        options: vm.validForwardOptions,
        required: true,
        maxlength: 50
      },
      validators: {
        callForward: {
          expression: ValidationService.callForward,
          message: function () {
            return $translate.instant('validation.callForward');
          }
        }
      },
      hideExpression: function ($viewValue, $modelValue, scope) {
        return !scope.model.forwardExternalCalls || scope.model.forward !== 'busy';
      }
    }];

    vm.simultaneousCalls = [{
      key: 'simultaneousTwo',
      defaultValue: true,
      type: 'radio',
      templateOptions: {
        model: 'incomingCallMaximum',
        label: $translate.instant('multipleCalls.two'),
        value: 2
      }
    }, {
      key: 'simultaneousEight',
      type: 'radio',
      templateOptions: {
        model: 'incomingCallMaximum',
        label: $translate.instant('multipleCalls.eight'),
        value: 8
      }
    }];

    vm.callerIdInfo = {};
    vm.hasDevice = true;
    vm.callerIdFields = [{
      key: 'callerIdSelection',
      type: 'select',
      templateOptions: {
        options: [],
        labelfield: 'label',
        valuefield: 'value'
      }
    }, {
      key: 'customName',
      type: 'input',
      templateOptions: {
        required: 'required',
        maxlength: 30,
        label: $translate.instant('callerIdPanel.customName')
      },
      hideExpression: function () {
        if (vm.callerIdInfo.callerIdSelection) {
          return vm.callerIdInfo.callerIdSelection.value.externalCallerIdType !== customCallerId_type;
        }
      }
    }, {
      key: 'customNumber',
      type: 'input',
      templateOptions: {
        required: 'required',
        minlength: 10,
        maxlength: 12,
        label: $translate.instant('callerIdPanel.customNumber')
      },
      validators: {
        phoneNumber: {
          expression: vm.validations.phoneNumber,
          message: function () {
            return $translate.instant('callerIdPanel.customNumberValidation');
          }
        }
      },
      hideExpression: function () {
        if (vm.callerIdInfo.callerIdSelection) {
          return vm.callerIdInfo.callerIdSelection.value.externalCallerIdType !== customCallerId_type;
        }
      }
    }];

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
        if (vm.directoryNumber.uuid) {
          internalNumberPool.push(vm.directoryNumber);
        }
        vm.internalNumberPool = internalNumberPool;
      }).catch(function (response) {
        vm.internalNumberPool = [];
        Notification.errorResponse(response, 'directoryNumberPanel.internalNumberPoolError');
      });
    }

    function getMultipleCalls() {
      LineSettings.getSimultaneousCalls(vm.telephonyInfo.currentDirectoryNumber.uuid, vm.currentUser.id).then(function (simultaneous) {
        vm.simultaneousModel = {
          incomingCallMaximum: simultaneous.incomingCallMaximum
        };
      }).catch(function (response) {
        Notification.errorResponse(response, 'simultaneousCalls.mulitpleCallsLoadError');
      });
    }

    function updateMultipleCalls() {
      LineSettings.updateSimultaneousCalls(vm.telephonyInfo.currentDirectoryNumber.uuid, vm.currentUser.id, vm.simultaneousModel);
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
      getMultipleCalls();

      vm.externalNumberPool = TelephonyInfoService.getExternalNumberPool();
      toggleShowExtensions();

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
        vm.cfModel.forward = 'none';
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
        TelephonyInfoService.updateAlternateDirectoryNumber('none');
      } else {
        // update alternate number first
        if (typeof directoryNumber.altDnUuid === 'undefined' || directoryNumber.altDnUuid === 'none') {
          directoryNumber.altDnUuid = '';
          directoryNumber.altDnPattern = '';
        }
        TelephonyInfoService.updateAlternateDirectoryNumber(directoryNumber.altDnUuid, directoryNumber.altDnPattern);
        TelephonyInfoService.updateCurrentDirectoryNumber(directoryNumber.uuid, directoryNumber.pattern, directoryNumber.dnUsage, directoryNumber.userDnUuid, directoryNumber.dnSharedUsage);
      }
    }

    // triggers UI changes to show or hide DID and DN elements
    function toggleShowExtensions() {
      return DialPlanService.getCustomerDialPlanDetails().then(function (response) {
        if (response.extensionGenerated === "true") {
          vm.showExtensions = false;
          vm.internalNumberLabel = $translate.instant('directoryNumberPanel.externalNumberLabel');
        } else {
          vm.showExtensions = true;
          vm.internalNumberLabel = $translate.instant('directoryNumberPanel.internalNumberExtension');
        }
      }).catch(function (response) {
        Notification.errorResponse(response, 'serviceSetupModal.customerDialPlanDetailsGetError');
      });
    }

    // Synchronize the DIDs and DNs on the Line Settings page when selections change
    function syncDidDn(modifiedFieldName) {
      if (vm.showExtensions === false) {
        var dnLength = vm.assignedInternalNumber.pattern.length;
        // if the internalNumber was changed, find a matching DID and set the externalNumber to match
        if (modifiedFieldName === "internalNumber") {
          var matchingDid = _.find(vm.externalNumberPool, function (extNum) {
            return extNum.pattern.substr(-dnLength) === vm.assignedInternalNumber.pattern;
          });
          if (matchingDid) {
            vm.assignedExternalNumber = matchingDid;
            assignedExternalNumberChange();
          }
        }
        // if the externalNumber was changed, find a matching DN and set the internalNumber to match
        if (modifiedFieldName === "externalNumber") {
          assignedExternalNumberChange();
          var matchingDn = _.find(vm.internalNumberPool, {
            pattern: vm.assignedExternalNumber.pattern.substr(-dnLength)
          });
          if (matchingDn) {
            vm.assignedInternalNumber = matchingDn;
          }
        }
      } else {
        if (modifiedFieldName === "externalNumber") {
          assignedExternalNumberChange();
        }
      }
    }

    function saveLineSettings() {
      //variable to set ESN for voicemail if the primary has changed
      var esn = vm.telephonyInfo.esn;
      var companyNumberObj = null;
      vm.saveInProcess = true; // Set flag for "Save" button behavior

      var callForwardSet = processCallForward();
      if (callForwardSet === true) {
        if (typeof vm.directoryNumber.uuid !== 'undefined' && vm.directoryNumber.uuid !== '') {
          // line exists
          var promise;
          var promises = [];
          if (vm.callerIdInfo.callerIdSelection.value.uuid) {
            companyNumberObj = {
              uuid: vm.callerIdInfo.callerIdSelection.value.uuid
            };
          }
          vm.directoryNumber.externalCallerIdType = vm.callerIdInfo.callerIdSelection.value.externalCallerIdType;
          vm.directoryNumber.companyNumber = companyNumberObj;
          if (vm.directoryNumber.externalCallerIdType == customCallerId_type) {
            vm.directoryNumber.customCallerIdName = vm.callerIdInfo.customName;
            vm.directoryNumber.customCallerIdNumber = vm.callerIdInfo.customNumber;
          }
          promise = processSharedLineUsers().then(function () {
            return listSharedLineUsers(vm.directoryNumber.uuid);
          });
          promises.push(promise);

          updateMultipleCalls();

          var dnPromise;
          var dnPromises = [];
          if (vm.telephonyInfo.alternateDirectoryNumber.uuid !== vm.assignedExternalNumber.uuid) { // external line
            if ((vm.telephonyInfo.alternateDirectoryNumber.uuid === '' || vm.telephonyInfo.alternateDirectoryNumber.uuid === 'none') && vm.assignedExternalNumber.uuid !== 'none') { // no existing external line, add external line
              dnPromise = LineSettings.addExternalLine(vm.directoryNumber.uuid, vm.assignedExternalNumber.pattern)
                .then(function () {
                  processExternalNumberList();
                });
              dnPromises.push(dnPromise);
            } else if ((vm.telephonyInfo.alternateDirectoryNumber.uuid !== '' && vm.telephonyInfo.alternateDirectoryNumber.uuid !== 'none') && vm.assignedExternalNumber.uuid !== 'none') { // changing external line
              dnPromise = LineSettings.changeExternalLine(vm.directoryNumber.uuid, vm.telephonyInfo.alternateDirectoryNumber.uuid, vm.assignedExternalNumber.pattern)
                .then(function () {
                  processExternalNumberList();
                });
              dnPromises.push(dnPromise);
            } else if (vm.telephonyInfo.alternateDirectoryNumber.uuid !== '' && vm.assignedExternalNumber.uuid === 'none') {
              dnPromise = LineSettings.deleteExternalLine(vm.directoryNumber.uuid, vm.telephonyInfo.alternateDirectoryNumber.uuid)
                .then(function () {
                  processExternalNumberList();
                });
              dnPromises.push(dnPromise);
            }
          }

          promises.push($q.all(dnPromises)
            .then(function () {
              if (vm.telephonyInfo.currentDirectoryNumber.uuid !== vm.assignedInternalNumber.uuid) { // internal line
                return LineSettings.changeInternalLine(vm.telephonyInfo.currentDirectoryNumber.uuid, vm.telephonyInfo.currentDirectoryNumber.dnUsage, vm.assignedInternalNumber.pattern, vm.directoryNumber)
                  .then(function () {
                    vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                    vm.directoryNumber.uuid = vm.telephonyInfo.currentDirectoryNumber.uuid;
                    vm.directoryNumber.pattern = vm.telephonyInfo.currentDirectoryNumber.pattern;
                    esn = vm.telephonyInfo.siteSteeringDigit + vm.telephonyInfo.siteCode + vm.assignedInternalNumber.pattern;
                    processInternalNumberList();
                  });
              } else { // no line change, just update settings
                return LineSettings.updateLineSettings(vm.directoryNumber);
              }
            }));

          $q.all(promises)
            .then(function () {
              //Change dtmfid in voicemail if the primary line has changed
              if (vm.telephonyInfo.currentDirectoryNumber.dnUsage === 'Primary' && vm.telephonyInfo.services.indexOf('VOICEMAIL') !== -1) {
                return HuronUser.updateDtmfAccessId(vm.currentUser.id, esn);
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
              Notification.success('directoryNumberPanel.success');
              vm.saveInProcess = false; // Set flag for "Save" button behavior
              resetForm();
            })
            .catch(function (response) {
              Notification.errorResponse(response, 'directoryNumberPanel.error');
              vm.saveInProcess = false; // Set flag for "Save" button behavior
            });
        } else { // new line
          SharedLineInfoService.getUserLineCount(vm.currentUser.id)
            .then(function (totalLines) {
              if (totalLines < vm.maxLines) {
                vm.directoryNumber.alertingName = name;
                if (vm.callerIdInfo.callerIdSelection.value.uuid) {
                  companyNumberObj = {
                    uuid: vm.callerIdInfo.callerIdSelection.value.uuid
                  };
                }
                vm.directoryNumber.externalCallerIdType = vm.callerIdInfo.callerIdSelection.value.externalCallerIdType;
                vm.directoryNumber.companyNumber = companyNumberObj;
                if (vm.directoryNumber.externalCallerIdType == customCallerId_type) {
                  vm.directoryNumber.customCallerIdName = vm.callerIdInfo.customName;
                  vm.directoryNumber.customCallerIdNumber = vm.callerIdInfo.customNumber;
                }
                return LineSettings.addNewLine(vm.currentUser.id, getDnUsage(), vm.assignedInternalNumber.pattern, vm.directoryNumber, vm.assignedExternalNumber)
                  .then(function () {
                    return TelephonyInfoService.getUserDnInfo(vm.currentUser.id)
                      .then(function () {
                        vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
                        vm.directoryNumber.uuid = vm.telephonyInfo.currentDirectoryNumber.uuid;
                        vm.directoryNumber.pattern = vm.telephonyInfo.currentDirectoryNumber.pattern;
                        vm.directoryNumber.altDnUuid = vm.telephonyInfo.alternateDirectoryNumber.uuid;
                        vm.directoryNumber.altDnPattern = vm.telephonyInfo.alternateDirectoryNumber.pattern;
                        return processSharedLineUsers().then(function () {
                          return listSharedLineUsers(vm.directoryNumber.uuid);
                        });
                      }).then(function () {
                        Notification.success('directoryNumberPanel.success');
                        $state.go('user-overview.communication.directorynumber', {
                          directoryNumber: vm.directoryNumber
                        });
                        vm.saveInProcess = false; // Set flag for "Save" button behavior
                      });
                  });
              } else {
                Notification.error('directoryNumberPanel.maxLines', {
                  user: name
                });
                $state.go('user-overview.communication');
                vm.saveInProcess = false; // Set flag for "Save" button behavior
              }
            })
            .catch(function (response) {
              Notification.errorResponse(response, 'directoryNumberPanel.error');
            });
        }
      }
    }

    function deleteLineSettings() {
      // fill in the {{line}} and {{user}} for directoryNumberPanel.deleteConfirmation
      vm.confirmationDialogue = $translate.instant('directoryNumberPanel.deleteConfirmation', {
        line: vm.telephonyInfo.currentDirectoryNumber.pattern,
        user: name
      });

      $modal.open({
        templateUrl: 'modules/huron/lineSettings/deleteConfirmation.tpl.html',
        scope: $scope,
        type: 'dialog'
      }).result.then(function () {
        if (vm.telephonyInfo.currentDirectoryNumber.dnUsage != 'Primary') {
          return LineSettings.disassociateInternalLine(vm.currentUser.id, vm.telephonyInfo.currentDirectoryNumber.userDnUuid)
            .then(function () {
              TelephonyInfoService.getUserDnInfo(vm.currentUser.id);
              vm.telephonyInfo = TelephonyInfoService.getTelephonyInfo();
              Notification.success('directoryNumberPanel.disassociationSuccess');
              $state.go('user-overview.communication');
            }).then(function () {
              return disassociateSharedLineUsers(true);
            })
            .catch(function (response) {
              Notification.errorResponse(response, 'directoryNumberPanel.error');
            });
        }
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
      vm.callerIdOptions = [];
      var hasDirectLine = false;
      var hasCompanyCallerID = false;
      var isNewLine = true;
      if (angular.isDefined(vm.telephonyInfo.currentDirectoryNumber.uuid) && vm.telephonyInfo.currentDirectoryNumber.uuid !== 'new') {
        isNewLine = false;
      } else {
        isNewLine = true;
      }
      // Construct callerIdOptions
      return listSharedLineUsers(vm.telephonyInfo.currentDirectoryNumber.uuid).then(function () {
        CallerId.loadCompanyNumbers().then(function () {
            // load company numbers first
          vm.callerIdOptions = CallerId.getCompanyNumberList();
          vm.callerIdOptions.forEach(function (option) {
            if (option.value.externalCallerIdType === companyCallerId_type) {
              hasCompanyCallerID = true;
              option.label = companyCallerId_label;
            }
          });
        })
          .then(function () {
            // Direct Line
            if (angular.isDefined(vm.telephonyInfo.alternateDirectoryNumber.uuid) && vm.telephonyInfo.alternateDirectoryNumber.uuid !== '' && vm.telephonyInfo.alternateDirectoryNumber.uuid !== 'none') {
              hasDirectLine = true;
              var directLineUserName = getSharedLinePrimaryUserName();
              if (!directLineUserName) {
                directLineUserName = name;
              }
              vm.callerIdOptions.unshift(CallerId.constructCallerIdOption(directLine_label, directLine_type, directLineUserName, vm.telephonyInfo.alternateDirectoryNumber.pattern, null));
            }
            // Custom Caller ID
            vm.callerIdOptions.push(CallerId.constructCallerIdOption(custom_label, customCallerId_type, '', null));
            vm.callerIdFields[0].templateOptions.options = vm.callerIdOptions;
            // Blocked Outbound Caller ID
            vm.callerIdOptions.push(CallerId.constructCallerIdOption(blockedCallerId_label, blockedCallerId_type, $translate.instant('callerIdPanel.blockedCallerIdDescription'), '', null));
            vm.callerIdFields[0].templateOptions.options = vm.callerIdOptions;

            // Set default caller ID
            if (hasDirectLine) {
              vm.callerIdInfo.callerIdSelection = CallerId.getCallerIdOption(vm.callerIdOptions, directLine_type);
            } else if (hasCompanyCallerID) {
              vm.callerIdInfo.callerIdSelection = CallerId.getCallerIdOption(vm.callerIdOptions, companyCallerId_type);
            } else {
              vm.callerIdInfo.callerIdSelection = CallerId.getCallerIdOption(vm.callerIdOptions, blockedCallerId_type);
            }
            if (!isNewLine) {
              // load the caller ID for the current line
              vm.callerIdOptions.forEach(function (option) {
                if (option.value.externalCallerIdType === vm.directoryNumber.externalCallerIdType) {
                  if (option.value.externalCallerIdType === companyNumber_type) {
                    if (option.label === vm.directoryNumber.companyNumber.name) {
                      vm.callerIdInfo.callerIdSelection = option;
                    }
                  } else {
                    vm.callerIdInfo.callerIdSelection = option;
                    if (option.value.externalCallerIdType === customCallerId_type) {
                      vm.callerIdInfo.customName = vm.directoryNumber.customCallerIdName;
                      vm.callerIdInfo.customNumber = vm.directoryNumber.customCallerIdNumber;
                    } else {
                      vm.callerIdInfo.callerIdSelection = option;
                    }
                  }
                }
              });
            }
          })
          .catch(function (response) {
            Notification.errorResponse(response, 'callerIdPanel.companyNumberLoadError');
          });
      });
    }

    // Call Forward Radio Button Model
    function initCallForward() {
      if (vm.directoryNumber.callForwardAll.voicemailEnabled === 'true' || vm.directoryNumber.callForwardAll.destination !== null) {
        vm.cfModel.forward = 'all';
      } else if ((vm.directoryNumber.callForwardAll.voicemailEnabled === 'false' &&
          vm.directoryNumber.callForwardAll.destination === null &&
          vm.directoryNumber.callForwardBusy.voicemailEnabled === 'false' &&
          vm.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'false' &&
          vm.directoryNumber.callForwardBusy.destination === null &&
          vm.directoryNumber.callForwardBusy.intDestination === null &&
          vm.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'false' &&
          vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'false' &&
          vm.directoryNumber.callForwardNoAnswer.destination === null &&
          vm.directoryNumber.callForwardNoAnswer.intDestination === null) ||
        (vm.telephonyInfo.voicemail !== 'On' &&
          (vm.directoryNumber.callForwardBusy.intDestination === null ||
            vm.directoryNumber.callForwardBusy.intDestination === undefined) &&
          (vm.directoryNumber.callForwardBusy.destination === null ||
            vm.directoryNumber.callForwardBusy.destination === undefined))) {
        vm.cfModel.forward = 'none';
      } else {
        vm.cfModel.forward = 'busy';
        if (vm.directoryNumber.callForwardBusy.voicemailEnabled !== vm.directoryNumber.callForwardBusy.intVoiceMailEnabled ||
          vm.directoryNumber.callForwardNoAnswer.voicemailEnabled !== vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled ||
          vm.directoryNumber.callForwardBusy.destination !== vm.directoryNumber.callForwardBusy.intDestination ||
          vm.directoryNumber.callForwardNoAnswer.destination !== vm.directoryNumber.callForwardNoAnswer.intDestination) {
          vm.cfModel.forwardExternalCalls = true;
        } else {
          vm.cfModel.forwardExternalCalls = false;
        }
      }

      if ((vm.telephonyInfo.voicemail === 'On') && (vm.directoryNumber.callForwardAll.voicemailEnabled === 'true')) {
        vm.cfModel.forwardAllCalls = 'Voicemail';
      } else {
        vm.cfModel.forwardAllCalls = vm.directoryNumber.callForwardAll.destination;
      }

      if ((vm.telephonyInfo.voicemail === 'On') && (vm.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'true' || vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'true' || vm.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
        vm.cfModel.forwardNABCalls = 'Voicemail';
      } else {
        vm.cfModel.forwardNABCalls = vm.directoryNumber.callForwardBusy.intDestination; //CallForwardNoAnswer is the same value, chose shorter variable name
      }

      if ((vm.telephonyInfo.voicemail === 'On') && (vm.directoryNumber.callForwardBusy.voicemailEnabled === 'true' || vm.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'true' || vm.telephonyInfo.currentDirectoryNumber.uuid === 'new')) { // default to voicemail for new line
        vm.cfModel.forwardExternalNABCalls = 'Voicemail';
      } else {
        vm.cfModel.forwardExternalNABCalls = vm.directoryNumber.callForwardBusy.destination;
      }

      // error case
      // throw notification when vm is disabled but is not updated in db cfwdynamic and dnfeaturesettings table.
      if ((vm.telephonyInfo.voicemail === 'Off') && (vm.directoryNumber.callForwardAll.voicemailEnabled === 'true')) {
        Notification.errorResponse(vm.vmFwdMismatch);
      }

      if ((vm.telephonyInfo.voicemail === 'Off') && (vm.directoryNumber.callForwardBusy.intVoiceMailEnabled === 'true' || vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled === 'true')) {
        Notification.errorResponse(vm.vmFwdMismatch);
      }

      if ((vm.telephonyInfo.voicemail === 'Off') && (vm.directoryNumber.callForwardBusy.voicemailEnabled === 'true' || vm.directoryNumber.callForwardNoAnswer.voicemailEnabled === 'true')) {
        Notification.errorResponse(vm.vmFwdMismatch);
      }

    }

    function processCallForward() {
      if (vm.cfModel.forward === 'all') {
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

        if (vm.cfModel.forwardAllCalls === 'Voicemail') {
          vm.directoryNumber.callForwardAll.voicemailEnabled = true;
          vm.directoryNumber.callForwardAll.destination = '';
        } else if (vm.cfModel.forwardAllCalls !== '') {
          vm.directoryNumber.callForwardAll.voicemailEnabled = false;
          vm.directoryNumber.callForwardAll.destination = vm.cfModel.forwardAllCalls;
        } else {
          return false;
        }
      } else if (vm.cfModel.forward === 'none') {
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

        if (vm.cfModel.forwardExternalCalls) {

          if (vm.cfModel.forwardNABCalls === 'Voicemail') {
            vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = true;
            vm.directoryNumber.callForwardBusy.intDestination = '';
            vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = true;
            vm.directoryNumber.callForwardNoAnswer.intDestination = '';
            vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = true;
            vm.directoryNumber.callForwardNotRegistered.intDestination = '';
          } else if (vm.cfModel.forwardNABCalls !== '') {
            vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardBusy.intDestination = vm.cfModel.forwardNABCalls;
            vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardNoAnswer.intDestination = vm.cfModel.forwardNABCalls;
            vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardNotRegistered.intDestination = vm.cfModel.forwardNABCalls;
          } else {
            return false;
          }

          if (vm.cfModel.forwardExternalNABCalls === 'Voicemail') {
            vm.directoryNumber.callForwardBusy.voicemailEnabled = true;
            vm.directoryNumber.callForwardBusy.destination = '';
            vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = true;
            vm.directoryNumber.callForwardNoAnswer.destination = '';
            vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = true;
            vm.directoryNumber.callForwardNotRegistered.destination = '';
          } else if (vm.cfModel.forwardExternalNABCalls !== '') {
            vm.directoryNumber.callForwardBusy.voicemailEnabled = false;
            vm.directoryNumber.callForwardBusy.destination = vm.cfModel.forwardExternalNABCalls;
            vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
            vm.directoryNumber.callForwardNoAnswer.destination = vm.cfModel.forwardExternalNABCalls;
            vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
            vm.directoryNumber.callForwardNotRegistered.destination = vm.cfModel.forwardExternalNABCalls;
          } else {
            return false;
          }
        } else {
          if (vm.cfModel.forwardNABCalls === 'Voicemail') {
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
          } else if (vm.cfModel.forwardNABCalls !== '') {
            vm.directoryNumber.callForwardBusy.voicemailEnabled = false;
            vm.directoryNumber.callForwardBusy.destination = vm.cfModel.forwardNABCalls;
            vm.directoryNumber.callForwardBusy.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardBusy.intDestination = vm.cfModel.forwardNABCalls;
            vm.directoryNumber.callForwardNoAnswer.voicemailEnabled = false;
            vm.directoryNumber.callForwardNoAnswer.destination = vm.cfModel.forwardNABCalls;
            vm.directoryNumber.callForwardNoAnswer.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardNoAnswer.intDestination = vm.cfModel.forwardNABCalls;
            vm.directoryNumber.callForwardNotRegistered.voicemailEnabled = false;
            vm.directoryNumber.callForwardNotRegistered.destination = vm.cfModel.forwardNABCalls;
            vm.directoryNumber.callForwardNotRegistered.intVoiceMailEnabled = false;
            vm.directoryNumber.callForwardNotRegistered.intDestination = vm.cfModel.forwardNABCalls;
          } else {
            return false;
          }
        }
      }

      return true;
    }

    //fucntion keeps voicemail the default in real time if it is on and no other desination has been set
    $scope.$watch('forward', function () {
      if (vm.cfModel.forward === 'all' && vm.telephonyInfo.voicemail === 'On') {
        if (vm.directoryNumber.callForwardAll.destination === null) {
          vm.cfModel.forwardAllCalls = 'Voicemail';
        } else {
          vm.cfModel.forwardAllCalls = vm.directoryNumber.callForwardAll.destination;
        }
      } else if (vm.cfModel.forward === 'busy' && vm.telephonyInfo.voicemail === 'On') {
        if (vm.directoryNumber.callForwardBusy.destination === null || vm.directoryNumber.callForwardNoAnswer.destination === null) {
          vm.cfModel.forwardNABCalls = 'Voicemail';
        } else {
          vm.cfModel.forwardNABCalls = vm.directoryNumber.callForwardBusy.destination;
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
    function getUserList($searchStr) {

      var defer = $q.defer();

      UserListService.listUsers(vm.sort.startAt, vm.sort.maxCount, vm.sort.by, vm.sort.order, function (data) {
        if (data.success) {
          defer.resolve(data.Resources);
        } else {
          defer.reject();
        }
      }, $searchStr);

      return defer.promise;
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
          Notification.error('sharedLinePanel.invalidUser', {
            user: userInfo.name
          });
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
      var name;
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
                Notification.error('directoryNumberPanel.maxLines', {
                  user: name
                });
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
      vm.sharedLineEndpoints = [];
      vm.devices = [];
      if (angular.isDefined(dnUuid) && dnUuid !== 'new') {
        return SharedLineInfoService.loadSharedLineUsers(dnUuid, vm.currentUser.id)
          .then(function (users) {
            // If more than 1 user in the list, then the line is shared
            if (users.length > 1) {
              vm.sharedLineUsers = users;
            }
            vm.sharedLineBtn = !!vm.sharedLineUsers;
            return users;
          })
          .then(function (users) {
            return SharedLineInfoService.loadSharedLineUserDevices(dnUuid).then(function (devices) {
              if (users.length > 1) {
                vm.sharedLineEndpoints = devices;
                vm.devices = angular.copy(vm.sharedLineEndpoints);
              }
              return users;
            });
          });
      } else {
        return $q.when([]);
      }
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
      listSharedLineUsers(vm.directoryNumber.uuid);
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
      userName = userName || userId;
      return userName;
    }

    function saveDisabled() {
      if ((vm.internalNumberPool.length === 0 || vm.externalNumberPool.length === 0) && (vm.assignedInternalNumber.uuid === 'none' || vm.assignedExternalNumber.uuid === 'none')) {
        return true;
      }
      return false;
    }

    function getSharedLinePrimaryUserName() {
      var sharedLinePrimaryUserName = '';
      if (vm.telephonyInfo.currentDirectoryNumber.dnSharedUsage && vm.telephonyInfo.currentDirectoryNumber.dnSharedUsage.indexOf('Shared') !== -1) {
        angular.forEach(vm.sharedLineUsers, function (sharedLineUser) {
          if (sharedLineUser.dnUsage === 'Primary') {
            sharedLinePrimaryUserName = sharedLineUser.name;
          }
        });
      }
      return sharedLinePrimaryUserName;
    }

    function assignedExternalNumberChange() {
      // Remove the direct line from caller ID options
      var index = CallerId.getCallerIdOptionIndex(vm.callerIdOptions, directLine_type);
      if (index > -1) {
        vm.callerIdOptions.splice(index, 1);
      }
      // add the Direct Line to caller ID options
      var directLineUserName = getSharedLinePrimaryUserName();
      if (!directLineUserName) {
        directLineUserName = name;
      }
      if (vm.assignedExternalNumber.uuid !== "none") {
        vm.callerIdOptions.unshift(CallerId.constructCallerIdOption(directLine_label, directLine_type, directLineUserName, vm.assignedExternalNumber.pattern, null));
      }
      // Set the current caller ID selection
      if (vm.callerIdInfo.callerIdSelection.value.externalCallerIdType === directLine_type) {
        if (vm.assignedExternalNumber.uuid !== "none") {
          vm.callerIdInfo.callerIdSelection = CallerId.getCallerIdOption(vm.callerIdOptions, directLine_type);
        } else {
          vm.callerIdInfo.callerIdSelection = CallerId.getCallerIdOption(vm.callerIdOptions, blockedCallerId_type);
        }
      }
    }

    // Check to see if the currently selected directory number's first digit is
    // the same as the company steering digit.
    function checkDnOverlapsSteeringDigit() {
      var overlaps = false;
      var dnFirstCharacter = vm.assignedInternalNumber.pattern.charAt(0);
      var steeringDigit = vm.telephonyInfo.steeringDigit;
      if (dnFirstCharacter === steeringDigit) {
        overlaps = true;
      }
      return overlaps;
    }

    init();
  }
})();
