(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialCtrl', TrialCtrl);

  /* @ngInject */
  function TrialCtrl($q, $state, $scope, $stateParams, $translate, $window, Analytics, Authinfo, Config, HuronCustomer, FeatureToggleService, Notification, Orgservice, TrialContextService, TrialDeviceService, TrialPstnService, TrialService, ValidationService) {
    var vm = this;

    var _careDefaultQuantity = 15;
    var _roomSystemDefaultQuantity = 5;
    var _licenseCountDefaultQuantity = 0;
    var _trialDurationDefaultLength = 30;

    var _messageTemplateOptionId = 'messageTrial';
    var _meetingTemplateOptionId = 'meetingTrial';
    var _webexTemplateOptionId = 'webexTrial';
    var _callTemplateOptionId = 'callTrial';
    var _roomSystemsTemplateOptionId = 'roomSystemsTrial';
    var _sparkBoardTemplateOptionId = 'sparkBoardTrial';

    var debounceTimeout = 2000;
    var mode = ($stateParams.mode === 'edit') ? 'edit' : 'add';

    vm.customerOrgId = undefined;
    /*vm.trialDetails = {}; AG TODO - check if used */

    vm.currentTrial = angular.copy($stateParams.currentTrial);
    vm.stateDetails = angular.copy($stateParams.details);
    vm.trialData = TrialService.getData();
    $scope.trialData = vm.trialData;
    vm.details = vm.trialData.details;
    vm.licenseCountChanged = false;

    vm.uniqueName = false;
    vm.uniqueEmail = false;

    vm.showRoomSystems = false;
    vm.showContextServiceTrial = false;
    vm.showCare = false;

    vm.messageTrial = vm.trialData.trials.messageTrial;
    vm.meetingTrial = vm.trialData.trials.meetingTrial;
    vm.webexTrial = vm.trialData.trials.webexTrial;
    vm.callTrial = vm.trialData.trials.callTrial;
    vm.roomSystemTrial = vm.trialData.trials.roomSystemTrial;
    vm.sparkBoardTrial = vm.trialData.trials.sparkBoardTrial;
    vm.pstnTrial = vm.trialData.trials.pstnTrial;
    vm.contextTrial = vm.trialData.trials.contextTrial;
    vm.careTrial = vm.trialData.trials.careTrial;
    vm.hasUserServices = hasUserServices;
    _licenseCountDefaultQuantity = vm.trialData.details.licenseCount;

    vm.isNewTrial = isNewTrial;
    vm.isEditTrial = isEditTrial;

    if (vm.isNewTrial()) {
      vm.preset = {};
      vm.stateDefaults = {
        stateNamePrefix: '',
        licenseCount: _licenseCountDefaultQuantity,
        trialDuration: _trialDurationDefaultLength,
        finalState: 'trialAdd.finishSetup',
        roomSystemsDefault: _roomSystemDefaultQuantity,
        sparkBoardDefault: _roomSystemDefaultQuantity,
      };
    } else {
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
        careLicenseValue: _.get(findOffer(Config.offerTypes.care), 'licenseCount', 0),
        context: false // we don't know this yet, so default to false
      };

      vm.stateDefaults = {
        stateNamePrefix: '',
        licenseCount: vm.preset.licenseCount,
        trialDuration: vm.currentTrial.duration,
        finalState: 'trial.finishSetup',
        roomSystemsDefault: vm.preset.roomSystemsValue,
        sparkBoardDefault: vm.preset.sparkBoardValue
      };

      vm.details.licenseCount = vm.preset.licenseCount;
      vm.details.licenseDuration = vm.preset.licenseDuration;
      vm.roomSystemTrial.details.quantity = vm.preset.roomSystemsValue;
      vm.sparkBoardTrial.details.quantity = vm.preset.sparkBoardValue;
      vm.careTrial.details.quantity = vm.preset.careLicenseValue;
      vm.canSeeDevicePage = true;
    }

    var stateNamePrefix = vm.stateDefaults.stateNamePrefix;
    vm.trialStates = [{
      name: 'trial' + stateNamePrefix + '.webex',
      trials: [vm.webexTrial],
      enabled: true,
    }, {
      name: 'trial' + stateNamePrefix + '.call',
      trials: [vm.callTrial, vm.roomSystemTrial],
      enabled: true,
    }, {
      name: 'trial' + stateNamePrefix + '.pstn',
      trials: [vm.pstnTrial],
      enabled: true,
    }, {
      name: 'trial' + stateNamePrefix + '.emergAddress',
      trials: [vm.pstnTrial],
      enabled: true,
    }];
    // Navigate trial modal in this order
    vm.navOrder = ['trial' + stateNamePrefix + '.info', 'trial' + stateNamePrefix + '.webex', 'trial' + stateNamePrefix + '.pstn', 'trial' + stateNamePrefix + '.emergAddress', 'trial' + stateNamePrefix + '.call'];
    vm.navStates = ['trial' + stateNamePrefix + '.info'];

    vm.nonTrialServices = [{
      // Context Service Trial
      model: vm.contextTrial,
      key: 'enabled',
      type: 'checkbox',
      templateOptions: {
        label: $translate.instant('trials.context'),
        id: 'contextTrial'
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
        }
      }
    }];

    vm.meetingFields = [{
      // Meeting Trial
      model: vm.meetingTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.meeting'),
        id: _meetingTemplateOptionId,
        class: '',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.meeting;
        }
      }
    }, {
      // Webex Trial
      model: vm.webexTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.webex'),
        id: _webexTemplateOptionId,
        class: '',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.webex;
        }
      }
    }];

    vm.callFields = [{
      // Call Trial
      model: vm.callTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.call'),
        id: _callTemplateOptionId,
        class: '',
      },
      'hideExpression': function () {
        return !vm.hasCallEntitlement;
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.call;
        }
      }
    }];

    vm.careFields = [{
      // Care Trial
      model: vm.careTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        id: 'careTrial',
        label: $translate.instant('trials.care')
      },
      hideExpression: function () {
        return !vm.showCare;
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return (vm.messageTrial.enabled && vm.callTrial.enabled); // Since, it depends on Message and Call Offer
        },
        'templateOptions.disabled': function () {
          return messageOfferDisabledExpression() || callOfferDisabledExpression() || vm.preset.care;
        }
      }
    }, {
      model: vm.careTrial.details,
      key: 'quantity',
      type: 'input',
      name: 'trialCareLicenseCount',
      className: '',
      templateOptions: {
        id: 'trialCareLicenseCount',
        inputClass: 'medium-5 small-offset-1',
        secondaryLabel: $translate.instant('trials.licenses'),
        type: 'number'
      },
      modelOptions: {
        allowInvalid: true
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return vm.careTrial.enabled;
        },
        'templateOptions.disabled': function () {
          return careLicenseInputDisabledExpression();
        }
      },
      validators: {
        quantity: {
          expression: function ($viewValue, $modelValue) {
            return validateCareLicense($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialCareQuantity');
          }
        }
      },
      watcher: {
        expression: function () {
          return vm.details.licenseCount;
        },
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.formControl.$validate();
          }
        }
      }
    }];

    // Room Systems Trial
    vm.roomSystemFields = [{
      model: vm.roomSystemTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.roomSystem'),
        id: _roomSystemsTemplateOptionId
      },
      watcher: {
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.model.details.quantity = newValue ? _roomSystemDefaultQuantity : 0;
          }
        }
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
        type: 'number'
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
          }
        }
      }
    }];

    vm.sparkBoardFields = [{
      model: vm.sparkBoardTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        id: _sparkBoardTemplateOptionId,
        label: $translate.instant('trials.sparkBoardSystem')
      },
      watcher: {
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.model.details.quantity = newValue ? _roomSystemDefaultQuantity : 0;
          }
        }
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.sparkBoard;
        }
      }
    },
    {
      model: vm.sparkBoardTrial.details,
      key: 'quantity',
      type: 'input',
      className: '',
      templateOptions: {
        id: 'trialSparkBoardAmount',
        inputClass: 'medium-5 small-offset-1',
        secondaryLabel: $translate.instant('trials.licenses'),
        type: 'number'
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
          }
        }
      }
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

        secondaryLabel: $translate.instant('trials.users')
      },
      modelOptions: {
        allowInvalid: true
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

            return ($viewValue === 0) ? vm.stateDefaults.licenseCount : $viewValue;
          } else {
            return 0;
          }
        }
      },

      validators: {
        count: {
          expression: function ($viewValue, $modelValue) {
            return !hasUserServices() || ValidationService.trialLicenseCount($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialLicenseCount');
          }
        },
        countWithCare: {
          expression: function () {
            return careLicenseCountLessThanTotalCount();
          },
          message: function () {
            return $translate.instant('partnerHomePage.careLicenseCountExceedsTotalCount');
          }
        }
      },

      watcher: {
        expression: function () {
          return vm.careTrial.details.quantity;
        },
        listener: function (field, newValue, oldValue) {
          if (newValue !== oldValue) {
            field.formControl.$validate();
          }
        }
      }
    }];

    vm.trialTermsFields = [{
      model: vm.details,
      key: 'licenseDuration',
      type: 'select',
      defaultValue: vm.stateDefaults.trialDuration,
      templateOptions: {
        labelfield: 'label',
        required: true,
        label: $translate.instant('partnerHomePage.duration'),
        secondaryLabel: $translate.instant('partnerHomePage.durationHelp'),
        labelClass: '',
        inputClass: 'medium-5',
        options: [30, 60, 90],
        onChange: function () {
          if (vm.isEditTrial()) {
            vm.licenseCountChanged = true;
            isProceedDisabled();
          }
        }
      },
    }];

    /* ONLY FOR ADD */
    vm.custInfoFields = [{
      model: vm.details,
      key: 'customerName',
      type: 'cs-input',
      templateOptions: {
        label: $translate.instant('partnerHomePage.customerName'),
        required: true,
        maxlength: 50,
        onInput: function (value, options) {
          options.validation.show = false;
          vm.uniqueName = false;
        },
        onBlur: function (value, options) {
          options.validation.show = null;
        }
      },
      asyncValidators: {
        uniqueName: {
          expression: function ($viewValue, $modelValue, scope) {
            return $q(function (resolve, reject) {
              validateField($viewValue, scope, 'organizationName', 'uniqueName', 'uniqueNameError').then(function (valid) {
                if (valid) {
                  resolve();
                } else {
                  reject();
                }
              });
            });
          },
          message: function () {
            return errorMessage('uniqueNameError');
          },
        }
      },
      modelOptions: {
        updateOn: 'default blur',
        debounce: {
          default: debounceTimeout,
          blur: 0
        },
      }
    }, {
      model: vm.details,
      key: 'customerEmail',
      type: 'cs-input',
      templateOptions: {
        label: $translate.instant('partnerHomePage.customerEmail'),
        type: 'email',
        required: true,
        onInput: function (value, options) {
          options.validation.show = false;
          vm.uniqueEmail = false;
        },
        onBlur: function (value, options) {
          options.validation.show = null;
        }
      },
      asyncValidators: {
        uniqueEmail: {
          expression: function ($viewValue, $modelValue, scope) {
            return $q(function (resolve, reject) {
              validateField($viewValue, scope, 'endCustomerEmail', 'uniqueEmail', 'uniqueEmailError').then(function (valid) {
                if (valid) {
                  resolve();
                } else {
                  reject();
                }
              });
            });
          },
          message: function () {
            return errorMessage('uniqueEmailError');
          }
        }
      },
      modelOptions: {
        updateOn: 'default blur',
        debounce: {
          default: debounceTimeout,
          blur: 0
        },
      }
    }];

    //AG_TODO: DOES IT NEED TO CHANGE IN EDIT?
   // US12171 - always entitle call (previously Authinfo.isSquaredUC())

    vm.hasCallEntitlement = Authinfo.isSquaredUC() || (vm.isNewTrial());
    vm.hasNextStep = hasNextStep;
    vm.previousStep = previousStep;
    vm.nextStep = nextStep;
    vm.finishSetup = finishSetup;
    vm.closeDialogBox = closeDialogBox;
    vm.editTrial = editTrial;
    vm.startTrial = startTrial;
    vm.isProceedDisabled = isProceedDisabled;
    vm.getDaysLeft = getDaysLeft;
    vm.launchCustomerPortal = launchCustomerPortal;
    vm.showDefaultFinish = showDefaultFinish;
    vm.cancelModal = cancelModal;
    vm.hasNextStep = hasNextStep;
    vm.getNextState = getNextState;
    vm.hasTrial = hasTrial;
    vm.messageOfferDisabledExpression = messageOfferDisabledExpression;
    vm.careLicenseInputDisabledExpression = careLicenseInputDisabledExpression;
    vm.validateCareLicense = validateCareLicense;
    vm.careLicenseCountLessThanTotalCount = careLicenseCountLessThanTotalCount;
    vm._helpers = {
      hasEnabled: hasEnabled,
      hasEnabledMessageTrial: hasEnabledMessageTrial,
      hasEnabledMeetingTrial: hasEnabledMeetingTrial,
      hasEnabledWebexTrial: hasEnabledWebexTrial,
      hasEnabledCallTrial: hasEnabledCallTrial,
      hasEnabledRoomSystemTrial: hasEnabledRoomSystemTrial,
      hasEnabledSparkBoardTrial: hasEnabledSparkBoardTrial,
      hasEnabledCareTrial: hasEnabledCareTrial,
      hasEnabledAnyTrial: hasEnabledAnyTrial,
      messageOfferDisabledExpression: messageOfferDisabledExpression,
      callOfferDisabledExpression: callOfferDisabledExpression,
      careLicenseInputDisabledExpression: careLicenseInputDisabledExpression,
      validateCareLicense: validateCareLicense,
      careLicenseCountLessThanTotalCount: careLicenseCountLessThanTotalCount
    };
    vm.devicesModal = _.find(vm.trialStates, {
      name: 'trialAdd.call'
    });


    init();

    ///////////////////////

    function init() {
      var isTestOrg = false;
      var overrideTestOrg = false;
      var getAdminOrgError = false;
      var promises = {
        atlasDarling: FeatureToggleService.atlasDarlingGetStatus(),
        ftCareTrials: FeatureToggleService.atlasCareTrialsGetStatus(),
        ftShipDevices: FeatureToggleService.atlasTrialsShipDevicesGetStatus(),  //TODO add true for shipping testing.
        ftSimplifiedTrialFlow: FeatureToggleService.supports(FeatureToggleService.features.huronSimplifiedTrialFlow),
        adminOrg: Orgservice.getAdminOrgAsPromise().catch(function (err) {
          getAdminOrgError = true;
          return err;
        }),
        sbTrial: FeatureToggleService.atlasDarlingGetStatus(),
        placesEnabled: FeatureToggleService.supports(FeatureToggleService.features.csdmPstn),
        atlasCreateTrialBackendEmail: FeatureToggleService.atlasCreateTrialBackendEmailGetStatus(),
      };
      if (!vm.isNewTrial()) {
        promises.tcHasService = TrialContextService.trialHasService(vm.currentTrial.customerOrgId);
      }

      $q.all(promises)
        .then(function (results) {
          vm.showRoomSystems = true;
          vm.roomSystemTrial.enabled = _isEnabledOnInit(true, vm.preset.roomSystems);
          vm.sparkBoardTrial.enabled = _isEnabledOnInit(results.atlasDarling, vm.preset.sparkBoard);
          vm.webexTrial.enabled = _isEnabledOnInit(true, vm.preset.webex);
          vm.meetingTrial.enabled = _isEnabledOnInit(true, vm.preset.meeting);
          vm.callTrial.enabled = vm.hasCallEntitlement && _isEnabledOnInit(true, vm.preset.call);
          vm.messageTrial.enabled = _isEnabledOnInit(true, vm.preset.message);
          vm.pstnTrial.enabled = vm.hasCallEntitlement;
          vm.showContextServiceTrial = true;
          vm.showCare = results.ftCareTrials;
          vm.careTrial.enabled = _isEnabledOnInit(results.ftCareTrials, vm.preset.care);
          vm.sbTrial = results.sbTrial;
          vm.simplifiedTrialFlow = results.ftSimplifiedTrialFlow;
          if (vm.isNewTrial()) {
            vm.atlasCreateTrialBackendEmailEnabled = results.atlasCreateTrialBackendEmail;
            vm.atlasTrialsShipDevicesEnabled = results.ftShipDevices;
          } else {
            vm.contextTrial.enabled = results.tcHasService;
            vm.preset.context = results.tcHasService;
          }
          updateTrialService(_messageTemplateOptionId);
          if (vm.isNewTrial()) {
            _setModalsForAdd();
            vm.placesEnabled = results.placesEnabled;
          }

          // To determine whether to display the ship devices page
          overrideTestOrg = results.ftShipDevices;
          if (!getAdminOrgError && results.adminOrg.data.success) {
            isTestOrg = results.adminOrg.data.isTestOrg;
          }
        }).finally(function () {
          vm.canSeeDevicePage = !isTestOrg || overrideTestOrg;
          vm.devicesModal.enabled = vm.canSeeDevicePage;
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

          vm.roomSystemFields[1].model.quantity = _shouldHaveDefault(vm.roomSystemTrial.enabled, vm.preset.roomSystems) ? vm.stateDefaults.roomSystemsDefault : 0;
          vm.sparkBoardFields[1].model.quantity = _shouldHaveDefault(vm.sparkBoardTrial.enabled, vm.preset.sparkBoard) ? vm.stateDefaults.sparkBoardDefault : 0;

          toggleTrial();
        });
    }

    function isNewTrial() {
      return mode === 'add';
    }

    function isEditTrial() {
      return mode === 'edit';
    }

    function _isEnabledOnInit(newTrialCondition, editTrialCondition) {
      if (vm.isNewTrial()) {
        return newTrialCondition;
      } else {
        return editTrialCondition;
      }
    }

    function _setModalsForAdd() {
      // TODO: US12063 overrides using this var but requests code to be left in for now
      //var devicesModal = _.find(vm.trialStates, {
      //  name: 'trialAdd.call'
      // });
      var meetingModal = _.find(vm.trialStates, {
        name: 'trial.webex'
      });
      var pstnModal = _.find(vm.trialStates, {
        name: 'trial.pstn'
      });
      var emergAddressModal = _.find(vm.trialStates, {
        name: 'trial.emergAddress'
      });

      pstnModal.enabled = vm.pstnTrial.enabled;
      emergAddressModal.enabled = vm.pstnTrial.enabled;
      meetingModal.enabled = true;
    }

    function _shouldHaveDefault(isEnabled, preset) {
      if (!isEnabled) {
        return false;
      } else {
        return vm.isNewTrial() || preset;
      }
    }

    function hasUserServices() {
      var services = [vm.callTrial, vm.meetingTrial, vm.webexTrial, vm.messageTrial];
      var result = _.some(services, {
        enabled: true
      });
      return result;
    }

    // If Webex Trials are enabled, we switch out offerType Collab for Message
    // This requires changing the label it contains as well
    function updateTrialService(templateOptionsId) {
      var index = _.findIndex(vm.messageFields, function (individualService) {
        return individualService.templateOptions.id === templateOptionsId;
      });
      if (index || vm.isEditTrial()) {
        switch (templateOptionsId) {
          case _messageTemplateOptionId:
            vm.messageFields[0].model.type = Config.offerTypes.message;
            vm.messageFields[0].templateOptions.label = $translate.instant('trials.message');
            break;
        }
      }
    }

    function toggleTrial() {
      if (vm.isEditTrial()) {
        if (!vm.callTrial.enabled) {
          vm.pstnTrial.enabled = false;
        }
        if (vm.callTrial.enabled && vm.hasCallEntitlement && !vm.pstnTrial.skipped) {
          vm.pstnTrial.enabled = true;
        }
        setViewState('trial.call', canAddDevice());
        setViewState('trial.webex', hasEnabledWebexTrial());
        setViewState('trial.pstn', hasEnabledCallTrial());
        setViewState('trial.emergAddress', hasEnabledCallTrial());

        addRemoveStates();

        var fieldsArray = [vm.individualServices, vm.messageFields, vm.meetingFields, vm.callFields, vm.licenseCountFields];

        _.forEach(fieldsArray, function (fields) {
          _.forEach(fields, function (service) {
            service.runExpressions();
          });
        });
      } else {
        if (!vm.callTrial.enabled && !(vm.roomSystemTrial.enabled && vm.placesEnabled)) {
          vm.pstnTrial.enabled = false;
        }
        if ((vm.callTrial.enabled || (vm.roomSystemTrial.enabled && vm.placesEnabled)) && vm.hasCallEntitlement && !vm.pstnTrial.skipped) {
          vm.pstnTrial.enabled = true;
        }
        addRemoveStates();
      }

    }

    function addRemoveStates() {
      _.forEach(vm.trialStates, function (state) {
        if (!state.enabled || _.every(state.trials, {
          enabled: false
        })) {
          removeNavState(state.name);
        } else {
          addNavState(state.name);
        }
      });
    }

    function hasTrial() {
      // Context is a non-trial service. We don't want the Next/Start
      // Trial button to be enabled if only Context is checked
      return _.some(vm.trialData.trials, function (service) {
        return service.enabled && service.type !== Config.offerTypes.context;
      });
    }

    function hasNextStep() {
      return !_.isUndefined(getNextState());
    }

    function finishSetup() {
      sendToAnalytics(Analytics.sections.TRIAL.eventNames.FINISH);
      $state.go(vm.stateDefaults.finalState);
    }

    function previousStep() {
      var state = getBackState();
      if (state) {
        sendToAnalytics(Analytics.eventNames.BACK);
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
        if (vm.isEditTrial()) {
          return editTrial(callback);
        } else {
          return startTrial(callback);
        }
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
            customerName: vm.details.customerName
          });
          return $q.reject(response);
        })
        .then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          if (vm.callTrial.enabled && !vm.preset.call) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function (response) {
                Notification.errorResponse(response, 'trialModal.squareducError');
                return $q.reject(response);
              }).then(function () {
                if (vm.pstnTrial.enabled) {
                  return TrialPstnService.createPstnEntity(vm.customerOrgId, response.data.customerName);
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
            customerName: vm.currentTrial.customerName
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

    function startTrial(addNumbersCallback) {
      vm.loading = true;
      sendToAnalytics(Analytics.sections.TRIAL.eventNames.START_TRIAL);

      return TrialService.startTrial()
        .catch(function (response) {
          Notification.errorResponse(response, 'trialModal.addError', {
            customerName: vm.details.customerName
          });
          return $q.reject(response);
        })
        .then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          return response;
        })
        .then(function (response) {
          return response;
        })
        .then(function (response) {
          if (vm.callTrial.enabled) {
            return HuronCustomer.create(vm.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function (response) {
                Notification.errorResponse(response, 'trialModal.squareducError');
                return $q.reject(response);
              }).then(function () {
                if (vm.pstnTrial.enabled) {
                  if (vm.simplifiedTrialFlow) {
                    return TrialPstnService.createPstnEntityV2(vm.customerOrgId, response.data.customerName);
                  } else {
                    return TrialPstnService.createPstnEntity(vm.customerOrgId, response.data.customerName);
                  }
                }
              });
          }
        })
        .then(function () {
          if (vm.contextTrial.enabled) {
            return TrialContextService.addService(vm.customerOrgId)
              .catch(function (response) {
                Notification.errorResponse(response, 'trialModal.startTrialContextServiceError');
                return $q.reject(response);
              });
          }
        })
        .then(function () {
          sendToAnalytics(Analytics.sections.TRIAL.eventNames.FINISH);
          Notification.success('trialModal.addSuccess', {
            customerName: vm.details.customerName
          });

          if (_.isFunction(addNumbersCallback)) {
            return addNumbersCallback(vm.customerOrgId)
              .catch(_.noop); //don't throw an error
          }
        })
        .then(function () {
          vm.finishSetup();
          return {
            customerOrgId: vm.customerOrgId
          };
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function hasOfferType(configOption) {
      return _.some(vm.currentTrial.offers, {
        id: configOption
      });
    }

    function findOffer(configOption) {
      return _.find(vm.currentTrial.offers, {
        id: configOption
      });
    }

    function setViewState(modalStage, value) {
      _.find(vm.trialStates, {
        name: modalStage
      }).enabled = value;
    }

    function isProceedDisabled() {
      var checks = [
        hasEnabledAnyTrial(vm, vm.preset),
        vm.preset.context !== vm.contextTrial.enabled,
        vm.preset.roomSystems && (vm.preset.roomSystemsValue !== vm.roomSystemTrial.details.quantity),
        vm.preset.sparkBoard && (vm.preset.sparkBoardValue !== vm.sparkBoardTrial.details.quantity),
        vm.preset.care && (vm.preset.careLicenseValue !== vm.careTrial.details.quantity),
        vm.preset.licenseCount !== vm.details.licenseCount,
        vm.licenseCountChanged,
        canAddDevice()
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

    function hasEnabledAnyTrial(vm, vmPreset) {
      // TODO: look into discrepancy for 'roomSystem' vs. 'roomSystems'
      return hasEnabledMessageTrial(vm.messageTrial, vmPreset) ||
        hasEnabledMeetingTrial(vm.meetingTrial, vmPreset) ||
        hasEnabledWebexTrial(vm.webexTrial, vmPreset) ||
        hasEnabledCallTrial(vm.callTrial, vmPreset) ||
        hasEnabledRoomSystemTrial(vm.roomSystemTrial, vmPreset) ||
        hasEnabledSparkBoardTrial(vm.sparkBoardTrial, vmPreset) ||
        hasEnabledCareTrial(vm.careTrial, vmPreset);
    }

    function messageOfferDisabledExpression() {
      if (!vm.messageTrial.enabled) {
        vm.careTrial.enabled = false;
      }
      return !vm.messageTrial.enabled;
    }

    function callOfferDisabledExpression() {
      if (!vm.callTrial.enabled) {
        vm.careTrial.enabled = false;
      }
      return !vm.callTrial.enabled;
    }

    function careLicenseInputDisabledExpression() {
      if (!vm.careTrial.enabled) {
        vm.careTrial.details.quantity = 0;
      } else {
        var needSetToDefault = (vm.isNewTrial() && (vm.careTrial.details.quantity === 0)) || (vm.isEditTrial() && !vm.careTrial.details.quantity);
        if (needSetToDefault) {
          vm.careTrial.details.quantity = _careDefaultQuantity;
        }
      }
      return !vm.careTrial.enabled;
    }

    function validateCareLicense($viewValue, $modelValue) {
      return !vm.careTrial.enabled || ValidationService.trialCareQuantity(
        $viewValue, $modelValue, vm.details.licenseCount);
    }

    function careLicenseCountLessThanTotalCount() {
      return (!vm.careTrial.enabled || +vm.details.licenseCount >= +vm.careTrial.details.quantity);
    }

    // TODO: this can be refactored as it is mostly a dupe of 'TrialAddCtrl.launchCustomerPortal'
    function launchCustomerPortal() {
      var customerOrgId = vm.isEditTrial() ? vm.currentTrial.customerOrgId : vm.customerOrgId;
      var customerOrgName = vm.isEditTrial() ? vm.currentTrial.customerName : vm.details.customerName;

      sendToAnalytics(Analytics.eventNames.YES);
      $window.open($state.href('login_swap', {
        customerOrgId: customerOrgId,
        customerOrgName: customerOrgName
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

    //new function
    function validateField($viewValue, scope, key, uniqueFlag, errorMsg) {
      // Show loading glyph
      vm.loading = true;
      vm[errorMsg] = null;

      // Fetch list of trials based on email in edit box...
      return TrialService.shallowValidation(key, $viewValue).then(function (response) {
        vm.loading = false;
        if (!_.isUndefined(response.unique)) {
          // name unique
          vm[uniqueFlag] = true;
          return true;
        }

        // Name in use, or API call failed
        vm[errorMsg] = response.error;
        scope.options.validation.show = true;
        return false;
      });
    }

    function errorMessage(key) {
      if (_.isUndefined(vm[key]) || vm[key] === '') {
        vm[key] = 'trialModal.errorFailSafe';
      }
      return $translate.instant(vm[key]);
    }
  }
})();
