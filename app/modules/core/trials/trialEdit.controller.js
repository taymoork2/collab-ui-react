(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialEditCtrl', TrialEditCtrl);

  /* @ngInject */
  function TrialEditCtrl($q, $state, $scope, $stateParams, $translate, $window, Analytics, Authinfo, Config, HuronCustomer, FeatureToggleService, Notification, Orgservice, TrialContextService, TrialDeviceService, TrialPstnService, TrialService, ValidationService) {
    var vm = this;

    vm.currentTrial = _.cloneDeep($stateParams.currentTrial);
    vm.trialDetails = {};
    vm.stateDetails = _.cloneDeep($stateParams.details);

    vm.customerOrgId = undefined;
    vm.licenseCountChanged = false;
    vm.showRoomSystems = false;
    vm.showContextServiceTrial = false;
    vm.showCare = false;
    vm.showBasicCare = false;
    vm.showAdvanceCare = false;
    var _messageTemplateOptionId = 'messageTrial';
    var _careDefaultQuantity = 15;

    vm.trialData = TrialService.getData();
    vm.details = vm.trialData.details;
    vm.messageTrial = vm.trialData.trials.messageTrial;
    vm.meetingTrial = vm.trialData.trials.meetingTrial;
    vm.webexTrial = vm.trialData.trials.webexTrial;
    vm.callTrial = vm.trialData.trials.callTrial;
    vm.roomSystemTrial = vm.trialData.trials.roomSystemTrial;
    vm.sparkBoardTrial = vm.trialData.trials.sparkBoardTrial;
    vm.pstnTrial = vm.trialData.trials.pstnTrial;
    vm.contextTrial = vm.trialData.trials.contextTrial;
    vm.careTrial = vm.trialData.trials.careTrial;
    vm.advanceCareTrial = vm.trialData.trials.advanceCareTrial;
    vm.hasUserServices = hasUserServices;

    vm.preset = {
      licenseCount: _.get(vm, 'currentTrial.licenses', 0),
      message: hasOfferType(Config.trials.message) || hasOfferType(Config.offerTypes.message),
      meeting: hasOfferType(Config.trials.message) || hasOfferType(Config.offerTypes.meeting) || hasOfferType(Config.offerTypes.meetings),
      webex: hasOfferType(Config.trials.meeting) || hasOfferType(Config.offerTypes.meetings) || hasOfferType(Config.offerTypes.webex),
      call: hasOfferType(Config.trials.call) || hasOfferType(Config.offerTypes.call),
      roomSystems: hasOfferType(Config.offerTypes.roomSystems),
      roomSystemsValue: _.get(findOffer(Config.offerTypes.roomSystems), 'licenseCount', 0),
      sparkBoard: hasOfferType(Config.offerTypes.sparkBoard),
      sparkBoardValue: _.get(findOffer(Config.offerTypes.sparkBoard), 'licenseCount', 0),
      licenseDuration: _.get(vm, 'currentTrial.duration', 0),
      care: hasOfferType(Config.offerTypes.care),
      advanceCare: hasOfferType(Config.offerTypes.advanceCare),
      careLicenseValue: _.get(findOffer(Config.offerTypes.care), 'licenseCount', 0),
      advanceCareLicenseValue: _.get(findOffer(Config.offerTypes.advanceCare), 'licenseCount', 0),
      context: false, // we don't know this yet, so default to false
    };

    vm.details.licenseCount = vm.preset.licenseCount;
    vm.details.licenseDuration = vm.preset.licenseDuration;
    vm.roomSystemTrial.details.quantity = vm.preset.roomSystemsValue;
    vm.sparkBoardTrial.details.quantity = vm.preset.sparkBoardValue;
    vm.careTrial.details.quantity = vm.preset.careLicenseValue;
    vm.advanceCareTrial.details.quantity = vm.preset.advanceCareLicenseValue;
    vm.canSeeDevicePage = true;

    vm.trialStates = [{
      name: 'trialEdit.webex',
      trials: [vm.webexTrial],
      enabled: true,
    }, {
      name: 'trialEdit.call',
      trials: [vm.callTrial, vm.roomSystemTrial],
      enabled: true,
    }, {
      name: 'trialEdit.pstn',
      trials: [vm.pstnTrial],
      enabled: true,
    }, {
      name: 'trialEdit.emergAddress',
      trials: [vm.pstnTrial],
      enabled: true,
    }];
    // Navigate trial modal in this order
    vm.navOrder = ['trialEdit.info', 'trialEdit.webex', 'trialEdit.pstn', 'trialEdit.emergAddress', 'trialEdit.call'];
    vm.navStates = ['trialEdit.info'];

    vm.nonTrialServices = [{
      // Context Service Trial
      model: vm.contextTrial,
      key: 'enabled',
      type: 'checkbox',
      templateOptions: {
        label: $translate.instant('trials.context'),
        id: 'contextTrial',
      },
    }];

    vm.messageFields = [{
      // Message Trial
      model: vm.messageTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.message'),
        id: _messageTemplateOptionId,
        class: '',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.message;
        },
      },
    }];

    vm.meetingFields = [{
      // Meeting Trial
      model: vm.meetingTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.meeting'),
        id: 'meetingTrial',
        class: '',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.meeting;
        },
      },
    }, {
      // Webex Trial
      model: vm.webexTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.webex'),
        id: 'webexTrial',
        class: '',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.webex;
        },
      },
    }];

    vm.callFields = [{
      // Call Trial
      model: vm.callTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.call'),
        id: 'squaredUCTrial',
        class: '',
      },
      'hideExpression': function () {
        return !vm.hasCallEntitlement;
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.call;
        },
      },
    }];

    vm.careFields = [{
      model: vm.careTrial.details,
      key: 'quantity',
      type: 'input',
      name: 'trialCareLicenseCount',
      className: '',
      templateOptions: {
        id: 'trialCareLicenseCount',
        inputClass: 'medium-5 small-offset-1',
        secondaryLabel: $translate.instant('trials.licenses'),
        type: 'number',
      },
      modelOptions: {
        allowInvalid: true,
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.careTrial.enabled;
        },
        'templateOptions.disabled': function () {
          return careLicenseInputDisabledExpression();
        },
      },
      validators: {
        quantity: {
          expression: function ($viewValue, $modelValue) {
            return validateCareLicense($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialCareQuantity');
          },
        },
      },
      watcher: {
        expression: function () {
          return vm.details.licenseCount - vm.advanceCareTrial.details.quantity;
        },
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.formControl.$validate();
          }
        },
      },
    }];

    vm.advanceCareFields = [{
      model: vm.advanceCareTrial.details,
      key: 'quantity',
      type: 'input',
      name: 'trialAdvanceCareLicenseCount',
      className: '',
      templateOptions: {
        id: 'trialAdvanceCareLicenseCount',
        inputClass: 'medium-5 small-offset-1',
        secondaryLabel: $translate.instant('trials.licenses'),
        type: 'number',
      },
      modelOptions: {
        allowInvalid: true,
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.advanceCareTrial.enabled;
        },
        'templateOptions.disabled': function () {
          return advanceCareLicenseInputDisabledExpression();
        },
      },
      validators: {
        quantity: {
          expression: function ($viewValue, $modelValue) {
            return validateAdvanceCareLicense($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialCareQuantity');
          },
        },
      },
      watcher: {
        expression: function () {
          return vm.details.licenseCount - vm.careTrial.details.quantity;
        },
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.formControl.$validate();
          }
        },
      },
    }];

    vm.licenseCountFields = [{
      model: vm.details,
      key: 'licenseCount',
      type: 'input',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.licenseQuantity'),
        inputClass: 'medium-5',
        type: 'number',

        secondaryLabel: $translate.instant('trials.users'),
      },
      modelOptions: {
        allowInvalid: true,
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return hasUserServices();
        },
        'templateOptions.disabled': function () {
          return !hasUserServices();
        },

        'model.licenseCount': function ($viewValue) {
          if (hasUserServices()) {
            return ($viewValue === 0) ? vm.preset.licenseCount : $viewValue;
          } else {
            return 0;
          }
        },
      },

      validators: {
        count: {
          expression: function ($viewValue, $modelValue) {
            return !hasUserServices() || ValidationService.trialLicenseCount($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialLicenseCount');
          },
        },
        countWithCare: {
          expression: function () {
            return careLicenseCountLessThanTotalCount();
          },
          message: function () {
            return $translate.instant('partnerHomePage.careLicenseCountExceedsTotalCount');
          },
        },
      },

      watcher: {
        expression: function () {
          return vm.careTrial.details.quantity + vm.advanceCareTrial.details.quantity;
        },
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.formControl.$validate();
          }
        },
      },
    }];

    vm.trialTermsFields = [{
      model: vm.details,
      key: 'licenseDuration',
      type: 'select',
      defaultValue: vm.currentTrial.duration,
      templateOptions: {
        labelfield: 'label',
        required: true,
        label: $translate.instant('partnerHomePage.duration'),
        secondaryLabel: $translate.instant('partnerHomePage.durationHelp'),
        labelClass: '',
        inputClass: 'medium-5',
        options: [30, 60, 90],
        onChange: function () {
          vm.licenseCountChanged = true;
          isProceedDisabled();
        },
      },
    }];

    // Room Systems Trial
    vm.roomSystemFields = [{
      model: vm.roomSystemTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.roomSystem'),
        id: 'trialRoomSystem',
      },
      watcher: {
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.model.details.quantity = newValue ? 5 : 0;
          }
        },
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.roomSystems;
        },
      },
    }, {
      model: vm.roomSystemTrial.details,
      key: 'quantity',
      type: 'input',
      className: '',
      templateOptions: {
        id: 'trialRoomSystemsAmount',
        inputClass: 'medium-5 small-offset-1',
        secondaryLabel: $translate.instant('trials.licenses'),
        type: 'number',
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.roomSystemTrial.enabled;
        },
        'templateOptions.disabled': function () {
          return !vm.roomSystemTrial.enabled;
        },
      },
      validators: {
        quantity: {
          expression: function ($viewValue, $modelValue) {
            return !vm.roomSystemTrial.enabled || ValidationService.trialRoomSystemQuantity($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialRoomSystemQuantity');
          },
        },
      },
    }];

    vm.sparkBoardFields = [{
      model: vm.sparkBoardTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        id: 'sparkBoardTrial',
        label: $translate.instant('trials.sparkBoardSystem'),
      },
      watcher: {
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.model.details.quantity = newValue ? 5 : 0;
          }
        },
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.sparkBoard;
        },
      },
    }, {
      model: vm.sparkBoardTrial.details,
      key: 'quantity',
      type: 'input',
      className: '',
      templateOptions: {
        id: 'trialSparkBoardAmount',
        inputClass: 'medium-5 small-offset-1',
        secondaryLabel: $translate.instant('trials.licenses'),
        type: 'number',
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.sparkBoardTrial.enabled;
        },
        'templateOptions.disabled': function () {
          return !vm.sparkBoardTrial.enabled;
        },
      },
      validators: {
        quantity: {
          expression: function ($viewValue, $modelValue) {
            return !vm.sparkBoardTrial.enabled || ValidationService.trialRoomSystemQuantity($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialSparkBoardQuantity');
          },
        },
      },
    }];

    vm.hasCallEntitlement = Authinfo.isSquaredUC();
    vm.hasNextStep = hasNextStep;
    vm.previousStep = previousStep;
    vm.nextStep = nextStep;
    vm.finishSetup = finishSetup;
    vm.closeDialogBox = closeDialogBox;
    vm.editTrial = editTrial;
    vm.isProceedDisabled = isProceedDisabled;
    vm.getDaysLeft = getDaysLeft;
    vm.launchCustomerPortal = launchCustomerPortal;
    vm.showDefaultFinish = showDefaultFinish;
    vm.cancelModal = cancelModal;
    vm._helpers = {
      hasEnabled: hasEnabled,
      hasEnabledMessageTrial: hasEnabledMessageTrial,
      hasEnabledMeetingTrial: hasEnabledMeetingTrial,
      hasEnabledWebexTrial: hasEnabledWebexTrial,
      hasEnabledCallTrial: hasEnabledCallTrial,
      hasEnabledRoomSystemTrial: hasEnabledRoomSystemTrial,
      hasEnabledSparkBoardTrial: hasEnabledSparkBoardTrial,
      hasEnabledCareTrial: hasEnabledCareTrial,
      hasEnabledAdvanceCareTrial: hasEnabledAdvanceCareTrial,
      hasEnabledAnyTrial: hasEnabledAnyTrial,

      messageOfferDisabledExpression: messageOfferDisabledExpression,
      callOfferDisabledExpression: callOfferDisabledExpression,
      careLicenseInputDisabledExpression: careLicenseInputDisabledExpression,
      advanceCareLicenseInputDisabledExpression: advanceCareLicenseInputDisabledExpression,
      validateCareLicense: validateCareLicense,
      validateAdvanceCareLicense: validateAdvanceCareLicense,
      careLicenseCountLessThanTotalCount: careLicenseCountLessThanTotalCount,
    };

    init();

    ///////////////////////

    function init() {
      var isTestOrg = false;
      var overrideTestOrg = false;
      var getAdminOrgError = false;
      var promises = {
        ftContextServ: FeatureToggleService.atlasContextServiceTrialsGetStatus(),
        tcHasService: TrialContextService.trialHasService(vm.currentTrial.customerOrgId),
        ftCareTrials: FeatureToggleService.atlasCareTrialsGetStatus(),
        ftAdvanceCareTrials: FeatureToggleService.atlasCareInboundTrialsGetStatus(),
        ftShipDevices: FeatureToggleService.atlasTrialsShipDevicesGetStatus(),  //TODO add true for shipping testing.
        adminOrg: Orgservice.getAdminOrgAsPromise().catch(function (err) {
          getAdminOrgError = true;
          return err;
        }),
        sbTrial: FeatureToggleService.atlasDarlingGetStatus(),
      };

      $q.all(promises)
        .then(function (results) {
          vm.showRoomSystems = true;
          vm.roomSystemTrial.enabled = vm.preset.roomSystems;
          vm.sparkBoardTrial.enabled = vm.preset.sparkBoard;
          vm.webexTrial.enabled = vm.preset.webex;
          vm.meetingTrial.enabled = vm.preset.meeting;
          vm.callTrial.enabled = vm.hasCallEntitlement && vm.preset.call;
          vm.messageTrial.enabled = vm.preset.message;
          vm.pstnTrial.enabled = vm.hasCallEntitlement;
          vm.showContextServiceTrial = true;
          vm.contextTrial.enabled = results.tcHasService;
          vm.preset.context = results.tcHasService;
          vm.showBasicCare = results.ftCareTrials;
          vm.showAdvanceCare = results.ftAdvanceCareTrials;
          vm.showCare = vm.showBasicCare || vm.showAdvanceCare;
          vm.careTrial.enabled = vm.preset.care;
          vm.advanceCareTrial.enabled = vm.preset.advanceCare;
          vm.sbTrial = results.sbTrial;
          updateTrialService(_messageTemplateOptionId);
          hasSetupPstn(vm.currentTrial.customerOrgId);

          // To determine whether to display the ship devices page
          overrideTestOrg = results.ftShipDevices;
          if (!getAdminOrgError && results.adminOrg.data.success) {
            isTestOrg = results.adminOrg.data.isTestOrg;
          }
        }).finally(function () {
          vm.canSeeDevicePage = !isTestOrg || overrideTestOrg;
          $scope.$watch(function () {
            return vm.trialData.trials;
          }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
              toggleTrial();
            }
          }, true);

          // Capture modal close and clear service
          if ($state.modal) {
            $state.modal.result.finally(function () {
              TrialService.reset();
            });
          }

          vm.roomSystemFields[1].model.quantity = (vm.roomSystemTrial.enabled && vm.preset.roomSystems) ? vm.preset.roomSystemsValue : 0;
          vm.sparkBoardFields[1].model.quantity = (vm.sparkBoardTrial.enabled && vm.preset.sparkBoard) ? vm.preset.sparkBoardValue : 0;

          toggleTrial();
        });
    }

    function hasUserServices() {
      var services = [vm.callTrial, vm.meetingTrial, vm.webexTrial, vm.messageTrial];
      var result = _.some(services, {
        enabled: true,
      });
      return result;
    }

    // If Webex Trials are enabled, we switch out offerType Collab for Message
    // This requires changing the label it contains as well
    function updateTrialService(templateOptionsId) {
      switch (templateOptionsId) {
        case _messageTemplateOptionId:
          vm.messageFields[0].model.type = Config.offerTypes.message;
          vm.messageFields[0].templateOptions.label = $translate.instant('trials.message');
          break;
      }
    }

    function isPstn() {
      return (((!vm.preset.call && hasEnabledCallTrial()) || (!vm.preset.roomSystems && hasEnabledRoomSystemTrial())) && !vm.preset.pstn);
    }

    function toggleTrial() {
      if (!vm.callTrial.enabled && !vm.roomSystemTrial.enabled & !vm.sparkBoardTrial.enabled) {
        vm.pstnTrial.enabled = false;
      }
      if ((vm.callTrial.enabled || vm.roomSystemTrial.enabled || vm.sparkBoardTrial.enabled) && vm.hasCallEntitlement && !vm.pstnTrial.skipped) {
        vm.pstnTrial.enabled = true;
      }
      setViewState('trialEdit.call', canAddDevice());
      setViewState('trialEdit.webex', hasEnabledWebexTrial());
      setViewState('trialEdit.pstn', isPstn());
      setViewState('trialEdit.emergAddress', isPstn());

      addRemoveStates();

      var fieldsArray = [vm.individualServices, vm.messageFields, vm.meetingFields, vm.callFields, vm.licenseCountFields];

      _.forEach(fieldsArray, function (fields) {
        _.forEach(fields, function (service) {
          service.runExpressions();
        });
      });
    }

    function addRemoveStates() {
      _.forEach(vm.trialStates, function (state) {
        if (!state.enabled || _.every(state.trials, {
          enabled: false,
        })) {
          removeNavState(state.name);
        } else {
          addNavState(state.name);
        }
      });
    }

    function hasNextStep() {
      return !_.isUndefined(getNextState());
    }

    function finishSetup() {
      sendToAnalytics(Analytics.sections.TRIAL.eventNames.FINISH);
      $state.go('trialEdit.finishSetup');
    }

    function previousStep() {
      sendToAnalytics(Analytics.eventNames.BACK);
      var state = getBackState();
      if (state) {
        $state.go(state);
      }
    }

    function getBackState() {
      return _.chain(vm.navStates)
        .indexOf($state.current.name)
        .thru(function (index) {
          return _.slice(vm.navStates, 0, index);
        })
        .findLast(function (state) {
          return !_.isUndefined(state);
        })
        .value();
    }

    function nextStep(callback) {
      if (!hasNextStep()) {
        return editTrial(callback);
      } else {
        sendToAnalytics(Analytics.eventNames.NEXT);
        return $state.go(getNextState());
      }
    }

    /**
     * Changed to chain and slice the navStates instead of navOrder
     * so that if you choose to skip a step that you are on
     * and that state gets removed from the order, the fucntion can
     * still find the next state and index won't find -1
     * when trying to find the next one
     */
    function getNextState() {
      return _.chain(vm.navOrder)
        .indexOf($state.current.name)
        .thru(function (index) {
          return _.slice(vm.navOrder, index + 1);
        })
        .find(_.partial(_.includes, vm.navStates))
        .value();
    }

    function addNavState(state) {
      vm.navStates[_.indexOf(vm.navOrder, state)] = state;
    }

    function removeNavState(state) {
      // just null out the position in array
      delete vm.navStates[_.indexOf(vm.navStates, state)];
    }

    function getDaysLeft(daysLeft) {
      if (daysLeft < 0) {
        return $translate.instant('customerPage.expired');
      } else if (daysLeft === 0) {
        return $translate.instant('customerPage.expiresToday');
      } else {
        return daysLeft;
      }
    }

    function closeDialogBox() {
      sendToAnalytics(Analytics.sections.TRIAL.eventNames.NO);
      $state.modal.close();
    }

    function editTrial(callback) {
      vm.loading = true;
      var custId = vm.currentTrial.customerOrgId;
      var trialId = vm.currentTrial.trialId;
      var showFinish = hasEnabledAnyTrial(vm, vm.preset);
      sendToAnalytics(Analytics.sections.TRIAL.eventNames.START_TRIAL);

      return TrialService.editTrial(custId, trialId)
        .catch(function (response) {
          Notification.errorResponse(response, 'trialModal.editError', {
            customerName: vm.details.customerName,
          });
          return $q.reject(response);
        })
        .then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          if ((vm.callTrial.enabled && !vm.preset.call) || (vm.roomSystemTrial.enabled && !vm.preset.roomSystems)) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function (response) {
                Notification.errorResponse(response, 'trialModal.squareducError');
                return $q.reject(response);
              }).then(function () {
                if (vm.pstnTrial.enabled && !vm.preset.pstn) {
                  return TrialPstnService.createPstnEntityV2(vm.customerOrgId, response.data.customerName);
                }
              });
          }
        })
        .then(function () {
          if (vm.preset.context !== vm.contextTrial.enabled) {
            if (vm.contextTrial.enabled) {
              return TrialContextService.addService(custId).catch(function (response) {
                Notification.errorResponse(response, 'trialModal.editTrialContextServiceEnableError');
                return $q.reject(response);
              });
            } else {
              return TrialContextService.removeService(custId).catch(function (response) {
                Notification.errorResponse(response, 'trialModal.editTrialContextServiceDisableError');
                return $q.reject(response);
              });
            }
          }
        })
        .then(function () {
          _.assign($stateParams.currentTrial, vm.currentTrial);
          Notification.success('trialModal.editSuccess', {
            customerName: vm.currentTrial.customerName,
          });

          if (_.isFunction(callback)) {
            return callback(vm.customerOrgId)
              .catch(_.noop); //don't throw an error
          }
        })
        .then(function () {
          if (showFinish) {
            finishSetup();
          } else {
            $state.modal.close();
          }
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function hasOfferType(configOption) {
      return _.some(vm.currentTrial.offers, {
        id: configOption,
      });
    }

    function findOffer(configOption) {
      return _.find(vm.currentTrial.offers, {
        id: configOption,
      });
    }

    function setViewState(modalStage, value) {
      _.find(vm.trialStates, {
        name: modalStage,
      }).enabled = value;
    }

    function isProceedDisabled() {
      var checks = [
        hasEnabledAnyTrial(vm, vm.preset),
        vm.preset.context !== vm.contextTrial.enabled,
        vm.preset.roomSystems && (vm.preset.roomSystemsValue !== vm.roomSystemTrial.details.quantity),
        vm.preset.sparkBoard && (vm.preset.sparkBoardValue !== vm.sparkBoardTrial.details.quantity),
        vm.preset.care && (vm.preset.careLicenseValue !== vm.careTrial.details.quantity),
        vm.preset.advanceCare && (vm.preset.advanceCareLicenseValue !== vm.advanceCareTrial.details.quantity),
        vm.preset.licenseCount !== vm.details.licenseCount,
        vm.licenseCountChanged,
        canAddDevice(),
      ];

      // bail at first true result
      return !_.reduce(checks, function (currentValue, sum) {
        if (sum) {
          return sum;
        }
        return currentValue;
      });
    }

    function hasEnabled(nowEnabled, previouslyEnabled) {
      return (nowEnabled === true && previouslyEnabled === false);
    }

    function hasEnabledMessageTrial(vmMessageTrial, vmPreset) {
      var trial = vmMessageTrial || vm.messageTrial;
      var preset = vmPreset || vm.preset;
      return hasEnabled(trial.enabled, preset.message);
    }

    function hasEnabledMeetingTrial(vmMeetingTrial, vmPreset) {
      var trial = vmMeetingTrial || vm.meetingTrial;
      var preset = vmPreset || vm.preset;
      return hasEnabled(trial.enabled, preset.meeting);
    }

    function hasEnabledWebexTrial(vmWebexTrial, vmPreset) {
      var trial = vmWebexTrial || vm.webexTrial;
      var preset = vmPreset || vm.preset;
      return hasEnabled(trial.enabled, preset.webex);
    }

    function hasEnabledCallTrial(vmCallTrial, vmPreset) {
      var trial = vmCallTrial || vm.callTrial;
      var preset = vmPreset || vm.preset;
      return hasEnabled(trial.enabled, preset.call);
    }

    function hasEnabledRoomSystemTrial(vmRoomSystemTrial, vmPreset) {
      var trial = vmRoomSystemTrial || vm.roomSystemTrial;
      var preset = vmPreset || vm.preset;
      return hasEnabled(trial.enabled, preset.roomSystems);
    }

    function hasEnabledSparkBoardTrial(vmSparkBoardTrial, vmPreset) {
      var trial = vmSparkBoardTrial || vm.roomSystemTrial;
      var preset = vmPreset || vm.preset;
      return hasEnabled(trial.enabled, preset.sparkBoard);
    }

    function hasEnabledCareTrial(vmCareTrial, vmPreset) {
      var trial = vmCareTrial || vm.careTrial;
      var preset = vmPreset || vm.preset;
      return hasEnabled(trial.enabled, preset.care);
    }

    function hasEnabledAdvanceCareTrial(vmAdvanceCareTrial, vmPreset) {
      var trial = vmAdvanceCareTrial || vm.advanceCareTrial;
      var preset = vmPreset || vm.preset;
      return hasEnabled(trial.enabled, preset.advanceCare);
    }

    function hasEnabledAnyTrial(vm, vmPreset) {
      // TODO: look into discrepancy for 'roomSystem' vs. 'roomSystems'
      return hasEnabledMessageTrial(vm.messageTrial, vmPreset) ||
        hasEnabledMeetingTrial(vm.meetingTrial, vmPreset) ||
        hasEnabledWebexTrial(vm.webexTrial, vmPreset) ||
        hasEnabledCallTrial(vm.callTrial, vmPreset) ||
        hasEnabledRoomSystemTrial(vm.roomSystemTrial, vmPreset) ||
        hasEnabledSparkBoardTrial(vm.sparkBoardTrial, vmPreset) ||
        hasEnabledCareTrial(vm.careTrial, vmPreset) ||
        hasEnabledAdvanceCareTrial(vm.advanceCareTrial, vmPreset);
    }

    function messageOfferDisabledExpression() {
      if (!vm.messageTrial.enabled) {
        vm.careTrial.enabled = false;
        vm.advanceCareTrial.enabled = false;
      }
      return !vm.messageTrial.enabled;
    }

    function callOfferDisabledExpression() {
      if (!vm.callTrial.enabled) {
        vm.careTrial.enabled = false;
        vm.advanceCareTrial.enabled = false;
      }
      return !vm.callTrial.enabled;
    }

    function careLicenseInputDisabledExpression() {
      if (!vm.careTrial.enabled) {
        vm.careTrial.details.quantity = 0;
      } else {
        vm.careTrial.details.quantity = vm.careTrial.details.quantity || _careDefaultQuantity;
      }
      return !vm.careTrial.enabled;
    }

    function advanceCareLicenseInputDisabledExpression() {
      if (!vm.advanceCareTrial.enabled) {
        vm.advanceCareTrial.details.quantity = 0;
      } else {
        vm.advanceCareTrial.details.quantity = vm.advanceCareTrial.details.quantity || _careDefaultQuantity;
      }
      return !vm.advanceCareTrial.enabled;
    }

    function validateCareLicense($viewValue, $modelValue) {
      var quantity = (vm.advanceCareTrial.enabled) ? vm.advanceCareTrial.details.quantity : 0;
      return !vm.careTrial.enabled || ValidationService.trialCareQuantity(
        $viewValue, $modelValue, vm.details.licenseCount - quantity);
    }

    function validateAdvanceCareLicense($viewValue, $modelValue) {
      var quantity = (vm.careTrial.enabled) ? vm.careTrial.details.quantity : 0;
      return !vm.advanceCareTrial.enabled || ValidationService.trialCareQuantity(
        $viewValue, $modelValue, vm.details.licenseCount - quantity);
    }

    function careLicenseCountLessThanTotalCount() {
      var advanceCareQuantity = (vm.advanceCareTrial.enabled) ? vm.advanceCareTrial.details.quantity : 0;
      var careQuantity = (vm.careTrial.enabled) ? vm.careTrial.details.quantity : 0;
      return (!(vm.careTrial.enabled || vm.advanceCareTrial.enabled) || +vm.details.licenseCount >= (careQuantity + advanceCareQuantity));
    }

    // TODO: this can be refactored as it is mostly a dupe of 'TrialAddCtrl.launchCustomerPortal'
    function launchCustomerPortal() {
      $window.open($state.href('login_swap', {
        customerOrgId: vm.currentTrial.customerOrgId,
        customerOrgName: vm.currentTrial.customerName,
      }));
      $state.modal.close();
    }

    function showDefaultFinish() {
      return !hasEnabledWebexTrial(vm.webexTrial, vm.preset);
    }

    function canAddDevice() {
      var stateDetails = vm.stateDetails.details;
      var roomSystemTrialEnabled = vm.roomSystemTrial.enabled;
      //TODO: add spark board
      var callTrialEnabled = vm.callTrial.enabled;
      var canSeeDevicePage = vm.canSeeDevicePage;

      return TrialDeviceService.canAddDevice(stateDetails, roomSystemTrialEnabled, callTrialEnabled, canSeeDevicePage);
    }
    function cancelModal() {
      $state.modal.dismiss();
      sendToAnalytics(Analytics.eventNames.CANCEL_MODAL);
    }
    function sendToAnalytics(eventName, extraData) {
      Analytics.trackTrialSteps(eventName, vm.trialData, extraData);
    }

    function hasSetupPstn(customerOrgId) {
      if (vm.pstnTrial.enabled) {
        TrialPstnService.checkForPstnSetup(customerOrgId)
          .then(function () {
            vm.preset.pstn = true;
          })
          .catch(function () {
            vm.preset.pstn = false;
          });
      }
    }

  }
})();
