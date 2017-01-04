(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialCtrl', TrialCtrl);

  /* @ngInject */
  function TrialCtrl($q, $state, $scope, $stateParams, $translate, $window, Analytics, Authinfo, Config, EmailService, HuronCustomer, FeatureToggleService, Notification, Orgservice, TrialContextService, TrialDeviceService, TrialPstnService, TrialService, ValidationService) {
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
    vm.currentTrial = ($stateParams.currentTrial) ? angular.copy($stateParams.currentTrial) : {};
    vm.stateDetails = ($stateParams.details) ? angular.copy($stateParams.details) : {};
    var mode = ($stateParams.mode === 'edit') ? 'edit' : 'add';

    vm.customerOrgId = undefined;
    vm.stateDefaults = {};
    vm.preset = {};
    vm.paidServices = {};

    vm.trialData = TrialService.getData();
    $scope.trialData = vm.trialData;
    vm.details = vm.trialData.details;
    vm.licenseCountChanged = false;

    vm.uniqueName = false;
    vm.uniqueEmail = false;

    vm.showRoomSystems = false;
    vm.showContextServiceTrial = false;
    vm.showCare = false;
    vm.isCallBackEnabled = false;

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
    vm.isExistingOrg = isExistingOrg;
    vm.isAddTrialValid = isAddTrialValid;


    var preset = (!vm.isExistingOrg()) ? getNewOrgPreset() : getExistingOrgPreset();
    var paidServices = (!vm.isExistingOrg()) ? {} : getPaidServices();
    _.extend(vm.paidServices, paidServices);
    _.assignWith(preset, paidServices, function (oVal, sVal) {
      return oVal || sVal.qty !== 0;
    });
    _.extend(vm.preset, preset);
    var stateDefaults = (vm.isNewTrial()) ? getAddModeStateDefaults() : getEditModeStateDefaults();
    _.extend(vm.stateDefaults, stateDefaults);

    vm.trialStates = [{
      name: 'trial.webex',
      trials: [vm.webexTrial],
      enabled: true,
    }, {
      name: 'trial.call',
      trials: [vm.callTrial, vm.roomSystemTrial],
      enabled: true,
    }, {
      name: 'trial.pstn',
      trials: [vm.pstnTrial],
      enabled: true,
    }, {
      name: 'trial.emergAddress',
      trials: [vm.pstnTrial],
      enabled: true,
    }];
    // Navigate trial modal in this order
    vm.navOrder = ['trial.info', 'trial.webex', 'trial.pstn', 'trial.emergAddress', 'trial.call'];
    vm.navStates = ['trial.info'];

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
      templateOptions: {
        label: $translate.instant('trials.message'),
        id: _messageTemplateOptionId,

      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.message;
        },
        'data.paid': function () {
          return vm.messageTrial.paid;
        },
      }
    }];

    vm.meetingFields = [{
      // Meeting Trial
      model: vm.meetingTrial,
      key: 'enabled',
      type: 'checkbox',
      templateOptions: {
        label: $translate.instant('trials.meeting'),
        id: _meetingTemplateOptionId,
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.meeting;
        },
        'data.paid': function () {
          return vm.meetingTrial.paid;
        },
      }
    }];

    vm.webexFields = [{
      // Webex Trial
      model: vm.webexTrial,
      key: 'enabled',
      type: 'checkbox',
      templateOptions: {
        label: $translate.instant('trials.webex'),
        id: _webexTemplateOptionId
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.webex;
        },
        'data.paid': function () {
          return vm.webexTrial.paid;
        },
      }
    }];

    vm.callFields = [{
      // Call Trial
      model: vm.callTrial,
      key: 'enabled',
      type: 'checkbox',
      templateOptions: {
        //label: $translate.instant('trials.call'),
        id: _callTemplateOptionId,

        inputClass: 'medium-5 small-offset-1',
        secondaryLabel: $translate.instant('trials.licenses')

      },
      hideExpression: function () {
        return !vm.hasCallEntitlement;
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.call;
        },
        'data.paid': function () {
          return vm.callTrial.paid;
        },
      }
    }];

    vm.careFields = [{
      // Care Trial
      model: vm.careTrial,
      key: 'enabled',
      type: 'checkbox',
      templateOptions: {
        id: 'careTrial',
        label: $translate.instant('trials.care')
      },
      hideExpression: function () {
        return !vm.showCare;
      },
      expressionProperties: {
        'templateOptions.required': function () {
          return (vm.messageTrial.enabled && (!vm.isCallBackEnabled || vm.callTrial.enabled)); // Since, it depends on Message and Call Offer
        },
        'templateOptions.disabled': function () {
          return messageOfferDisabledExpression() || (vm.isCallBackEnabled && callOfferDisabledExpression()) || vm.preset.care;
        },
        'data.paid': function () {
          return vm.careTrial.paid;
        },
      }
    }, {
      model: vm.careTrial.details,
      key: 'quantity',
      type: 'input',
      name: 'trialCareLicenseCount',
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
        'data.paid': function () {
          return vm.roomSystemTrial.paid;
        },
      },
    }, {
      model: vm.roomSystemTrial.details,
      key: 'quantity',
      type: 'input',
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
          return !vm.roomSystemTrial.enabled || vm.roomSystemTrial.paid;
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
        },
        'data.paid': function () {
          return vm.sparkBoardTrial.paid;
        },
      }
    }, {
      model: vm.sparkBoardTrial.details,
      key: 'quantity',
      type: 'input',
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
          return !vm.sparkBoardTrial.enabled || vm.sparkBoardTrial.paid;
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

   // US12171 - always entitle call (previously Authinfo.isSquaredUC())

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
    vm.getPaidServicesForDisplay = getPaidServicesForDisplay;
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
      careLicenseCountLessThanTotalCount: careLicenseCountLessThanTotalCount,
      saveTrialPstn: saveTrialPstn,
      saveTrialContext: saveTrialContext,
      getNewOrgInitResults: getNewOrgInitResults,
      getExistingOrgInitResults: getExistingOrgInitResults,
      getPaidLicenseQty: getPaidLicenseQty,
      hasOfferType: hasOfferType
    };
    vm.devicesModal = _.find(vm.trialStates, {
      name: 'trial.call'
    });

    init();

    ///////////////////////

    function init() {
      var isTestOrg = false;
      var overrideTestOrg = false;
      var getAdminOrgError = false;
      vm.hasCallEntitlement = Authinfo.isSquaredUC() || vm.isNewTrial();
      var promises = {
        atlasCareCallbackTrials: FeatureToggleService.atlasCareCallbackTrialsGetStatus(),
        atlasDarling: FeatureToggleService.atlasDarlingGetStatus(),
        ftCareTrials: FeatureToggleService.atlasCareTrialsGetStatus(),
        ftShipDevices: FeatureToggleService.atlasTrialsShipDevicesGetStatus(),  //TODO add true for shipping testing.
        adminOrg: Orgservice.getAdminOrgAsPromise().catch(function (err) {
          getAdminOrgError = true;
          return err;
        }),
        placesEnabled: FeatureToggleService.supports(FeatureToggleService.features.csdmPstn),
        atlasCreateTrialBackendEmail: FeatureToggleService.atlasCreateTrialBackendEmailGetStatus(),
      };
      if (!vm.isNewTrial()) {
        promises.tcHasService = TrialContextService.trialHasService(vm.currentTrial.customerOrgId);
      }

      $q.all(promises)
        .then(function (results) {
          vm.showRoomSystems = true;
          vm.showContextServiceTrial = true;
          vm.showCare = results.ftCareTrials;
          vm.sbTrial = results.atlasDarling;
          vm.isCallBackEnabled = results.atlasCareCallbackTrials;
          vm.atlasTrialsShipDevicesEnabled = results.ftShipDevices;
          vm.pstnTrial.enabled = vm.hasCallEntitlement;
          overrideTestOrg = results.ftShipDevices;
          if (!getAdminOrgError && results.adminOrg.data.success) {
            isTestOrg = results.adminOrg.data.isTestOrg;
          }
          vm.canSeeDevicePage = !isTestOrg || overrideTestOrg;
          vm.devicesModal.enabled = vm.canSeeDevicePage;

          var initResults = (vm.isExistingOrg()) ? getExistingOrgInitResults(results, vm.hasCallEntitlement, vm.preset, vm.paidServices) : getNewOrgInitResults(results, vm.hasCallEntitlement, vm.stateDefaults);
          _.merge(vm, initResults);
          if (vm.isNewTrial()) {
            vm.atlasCreateTrialBackendEmailEnabled = results.atlasCreateTrialBackendEmail;
            vm.placesEnabled = results.placesEnabled;
          }
          updateTrialService(_messageTemplateOptionId);
        })
        .catch(function (error) {
          vm.error = error;
        })
        .finally(function () {
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

          toggleTrial();
        });
    }

    function isNewTrial() {
      return mode === 'add';
    }

    function isEditTrial() {
      return mode === 'edit';
    }

    function isExistingOrg() {
      return !_.isNil(vm.currentTrial.customerOrgId);
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
      /* ALINA PR NOTE: Refactoring logic here.  Previously:
        FOR TrialAdd:
          if (!vm.callTrial.enabled && !(vm.roomSystemTrial.enabled && vm.placesEnabled)) {
            vm.pstnTrial.enabled = false;
          }
          if ((vm.callTrial.enabled || (vm.roomSystemTrial.enabled && vm.placesEnabled)) && vm.hasCallEntitlement && !vm.pstnTrial.skipped) {
            vm.pstnTrial.enabled = true;
          }
        FOR  TrialEdit:
          if (!vm.callTrial.enabled) {
            vm.pstnTrial.enabled = false;
          }
          if (vm.callTrial.enabled && vm.hasCallEntitlement && !vm.pstnTrial.skipped) {
            vm.pstnTrial.enabled = true;
          }
      */
      var newTrialPstnAdditonalTest = (vm.roomSystemTrial.enabled && vm.placesEnabled);
      if (vm.isEditTrial()) {
        newTrialPstnAdditonalTest = true;
      }
      if (!vm.callTrial.enabled && !newTrialPstnAdditonalTest) {
        vm.pstnTrial.enabled = false;
      } else if (vm.hasCallEntitlement && !vm.pstnTrial.skipped) {
        vm.pstnTrial.enabled = true;
      }
     /* ALINA PR NOTE: WHY the 'add trial for new org does not check trial.call modal?????
     For add it was additionally handled as can see device page but for edit it required
     (TrialRoomSystemService.canAddRoomSystemDevice(details, roomSystemsEnabled) || TrialCallService.canAddCallDevice(details, callEnabled));
      as well
      https://rally1.rallydev.com/#/76458540020d/detail/userstory/76477895516 comes into play as well, But I think that implementation
      below complies
      */

      setViewState('trial.call', canAddDevice());
      setViewState('trial.webex', hasEnabledWebexTrial());
      setViewState('trial.pstn', hasEnabledCallTrial());
      setViewState('trial.emergAddress', hasEnabledCallTrial());
      var fieldsArray = [vm.messageFields, vm.meetingFields, vm.webexFields, vm.callFields, vm.licenseCountFields];

      _.forEach(fieldsArray, function (fields) {
        _.forEach(fields, function (service) {
          if (typeof service.runExpressions === 'function') {
            service.runExpressions();
          }
        });
      });

      addRemoveStates();
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
      $state.go('trial.finishSetup');
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
          return saveTrialPstn(vm.customerOrgId, response.data.customerName, response.data.customerEmail);
        })
        .then(function () {
          return saveTrialContext(vm.customerOrgId);
        })
        .then(function () {
          _.assign($stateParams.currentTrial, vm.currentTrial);
          return saveTrialNotifySuccessAndCallback(callback, vm.currentTrial.customerName, vm.customerOrgId);
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
      if (isNewTrial() && isExistingOrg()) {
        _.each(vm.trialData.trials, function (trial) {
          if (trial.paid) {
            trial.enabled = false;
          }
        });
        vm.trialData.details.customerEmail = vm.currentTrial.customerEmail;
        vm.trialData.details.customerName = vm.currentTrial.customerName;
      }
      return TrialService.startTrial(vm.currentTrial.customerOrgId)
        .catch(function (response) {
          Notification.errorResponse(response, 'trialModal.addError', {
            customerName: vm.details.customerName
          });
          return $q.reject(response);
        }).then(function (response) {
          // suppress email if webex trial is enabled (more appropriately
          // handled by the backend process once provisioning is complete)
          if (!vm.webexTrial.enabled && !vm.atlasCreateTrialBackendEmailEnabled) {
            return EmailService.emailNotifyTrialCustomer(vm.details.customerEmail,
              vm.details.licenseDuration, Authinfo.getOrgId())
              .catch(function (response) {
                Notification.errorResponse(response, 'didManageModal.emailFailText');
              })
              .then(function () {
                return response;
              });
          }
          return response;
        }).then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          return saveTrialPstn(vm.customerOrgId, response.data.customerName, response.data.customerEmail);
        })
        .then(function () {
          return saveTrialContext(vm.customerOrgId);
        })
        .then(function () {
          return saveTrialNotifySuccessAndCallback(addNumbersCallback, vm.details.customerName, vm.customerOrgId);
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

    function hasOfferType() {
      var offerNames = [].slice.call(arguments);
      return _.chain(vm.currentTrial.offers).map('id').intersection(offerNames).value().length > 0;
    }

    function findOffer(configOption) {
      return _.find(vm.currentTrial.offers, {
        id: configOption
      });
    }


    function getPaidLicenseQty(licenseType, offerNames) {
      if (offerNames && !_.isArray(offerNames)) {
        offerNames = [offerNames];
      }

      var result = _.reduce(vm.currentTrial.licenseList, function (sum, license) {
        if (license.licenseType === licenseType && !license.isTrial && (!offerNames || _.includes(offerNames, license.offerName))) {
          return sum + license.volume;
        } else {
          return sum;
        }
      }, 0);

      return result;
    }


    function setViewState(modalStage, value) {

      _.find(vm.trialStates, {
        name: modalStage
      }).enabled = value;
    }

    function isProceedDisabled() {
      // ALINA PR note: change for adding to purchased. LicenseCount will be different
      var checks = [
        hasEnabledAnyTrial(vm, vm.preset),
        vm.preset.context !== vm.contextTrial.enabled,
        vm.preset.roomSystems && (vm.preset.roomSystemsValue !== vm.roomSystemTrial.details.quantity),
        vm.preset.sparkBoard && (vm.preset.sparkBoardValue !== vm.sparkBoardTrial.details.quantity),
        vm.preset.care && (vm.preset.careLicenseValue !== vm.careTrial.details.quantity),
        (vm.preset.licenseCount !== vm.details.licenseCount) && !(isNewTrial() && isExistingOrg()),
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
      return (nowEnabled === true && (previouslyEnabled === false || !isExistingOrg()));
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
      vm.careTrial.details.quantity = (!vm.careTrial.enabled) ? 0 : (vm.careTrial.details.quantity || _careDefaultQuantity);
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

    function isAddTrialValid(isFormValid) {
      if (!(isFormValid && vm.hasTrial())) {
        return false;
      }
      if (!vm.isExistingOrg()) {
        return (vm.uniqueName && vm.uniqueEmail);
      } else {
        return true;
      }
    }

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

    function getNewOrgPreset() {
      return { };
    }

    function getExistingOrgPreset() {
      return {
        licenseCount: _.get(vm, 'currentTrial.licenses', 0),
        message: hasOfferType(Config.trials.message, Config.offerTypes.message),
        meeting: hasOfferType(Config.trials.message, Config.offerTypes.meeting, Config.offerTypes.meetings),
        webex: hasOfferType(Config.trials.meeting, Config.offerTypes.meetings, Config.offerTypes.webex),
        call: hasOfferType(Config.trials.call, Config.offerTypes.call),
        roomSystems: hasOfferType(Config.offerTypes.roomSystems),
        roomSystemsValue: getServiceLicenseCount(Config.offerTypes.roomSystems, Config.licenseTypes.SHARED_DEVICES, Config.offerCodes.SD), //? _.get(findOffer(Config.offerTypes.roomSystems), 'licenseCount', 0),
        sparkBoard: hasOfferType(Config.offerTypes.sparkBoard),
        sparkBoardValue: getServiceLicenseCount(Config.offerTypes.sparkBoard, Config.licenseTypes.SHARED_DEVICES, Config.offerCodes.SB), //_.get(findOffer(Config.offerTypes.sparkBoard), 'licenseCount', 0),
        licenseDuration: _.get(vm, 'currentTrial.duration', 0),
        care: hasOfferType(Config.offerTypes.care),
        careLicenseValue: getServiceLicenseCount(Config.offerTypes.care, Config.licenseTypes.CARE), //_.get(findOffer(Config.offerTypes.care), 'licenseCount', 0),
        context: false // we don't know this yet, so default to false
      };
    }


    function getPaidServices() {
      return {
        message: {
          label: $translate.instant('trials.message'),
          qty: getPaidLicenseQty(Config.licenseTypes.MESSAGING)
        },
        meeting: {
          label: $translate.instant('trials.meeting'),
          qty: getPaidLicenseQty(Config.licenseTypes.CONFERENCING, [undefined, Config.offerCodes.CF])
        },
        webex: {
          label: $translate.instant('trials.webex'),
          qty: getPaidLicenseQty(Config.licenseTypes.CONFERENCING, [Config.offerCodes.EE, Config.offerCodes.MC, Config.offerCodes.SC, Config.offerCodes.TC, Config.offerCodes.EC, Config.offerCodes.CMR])
        },
        call: {
          label: $translate.instant('trials.call'),
          qty: getPaidLicenseQty(Config.licenseTypes.COMMUNICATION)
        },
        roomSystems: {
          label: $translate.instant('trials.roomSystem'),
          qty: getPaidLicenseQty(Config.licenseTypes.SHARED_DEVICES, Config.offerCodes.SD)
        },

        sparkBoard: {
          label: $translate.instant('trials.sparkBoardSystem'),
          qty: getPaidLicenseQty(Config.licenseTypes.SHARED_DEVICES, Config.offerCodes.SB)
        },

        care: {
          label: $translate.instant('trials.care'),
          qty: getPaidLicenseQty(Config.licenseTypes.CARE)
        },
        context: {
          label: $translate.instant('trials.context'),
          qty: 0 // we don't know this yet, so default to false
        }
      };
    }

    function getServiceLicenseCount(trialOfferCode, paidLicenseKey, paidOfferCode) {
      var licenseQty = _.get(findOffer(trialOfferCode), 'volume', 0) + getPaidLicenseQty(paidLicenseKey, paidOfferCode);
      return licenseQty;
    }


    function getAddModeStateDefaults() {
      return {
        licenseCount: _licenseCountDefaultQuantity,
        trialDuration: _trialDurationDefaultLength,
        roomSystemsDefault: _roomSystemDefaultQuantity,
        sparkBoardDefault: _roomSystemDefaultQuantity,
        careDefault: _careDefaultQuantity
      };
    }

    function getEditModeStateDefaults() {
      var stateDefaults = getAddModeStateDefaults();
      stateDefaults.trialDuration = vm.currentTrial.duration;
      return stateDefaults;
    }

    function getPaidServicesForDisplay() {
      return _.filter(vm.paidServices, function (service) {
        return service.qty > 0;
      });
    }

    function getNewOrgInitResults(results, hasCallEntitlement, stateDefaults) {
      var initResults = {};
      _.set(initResults, 'roomSystemTrial.enabled', true);
      _.set(initResults, 'sparkBoardTrial.enabled', results.atlasDarling);
      _.set(initResults, 'webexTrial.enabled', true);
      _.set(initResults, 'meetingTrial.enabled', true);
      _.set(initResults, 'callTrial.enabled', hasCallEntitlement);
      _.set(initResults, 'messageTrial.enabled', true);
      _.set(initResults, 'roomSystemTrial.details.quantity', stateDefaults.roomSystemsDefault);
      _.set(initResults, 'sparkBoardTrial.details.quantity', stateDefaults.sparkBoardDefault);
      _.set(initResults, 'careTrial.enabled', results.ftCareTrials);
      _.set(initResults, 'careTrial.details.quantity', stateDefaults.careDefault);
      return initResults;
    }

    function getExistingOrgInitResults(results, hasCallEntitlement, preset, paidServices) {
      var initResults = {};
      _.set(initResults, 'roomSystemTrial.enabled', preset.roomSystems);
      _.set(initResults, 'roomSystemTrial.paid', paidServices.roomSystems.qty);
      _.set(initResults, 'sparkBoardTrial.enabled', preset.sparkBoard);
      _.set(initResults, 'sparkBoardTrial.paid', paidServices.sparkBoard.qty);
      _.set(initResults, 'webexTrial.enabled', preset.webex);
      _.set(initResults, 'webexTrial.paid', paidServices.webex.qty);
      _.set(initResults, 'meetingTrial.enabled', preset.meeting);
      _.set(initResults, 'meetingTrial.paid', paidServices.meeting.qty);
      _.set(initResults, 'callTrial.enabled', preset.call);
      _.set(initResults, 'callTrial.paid', paidServices.call.qty);
      _.set(initResults, 'messageTrial.enabled', preset.message);
      _.set(initResults, 'messageTrial.paid', paidServices.message.qty);
      _.set(initResults, 'roomSystemTrial.details.quantity', preset.roomSystemsValue || paidServices.roomSystems.qty);
      _.set(initResults, 'sparkBoardTrial.details.quantity', paidServices.sparkBoardValue || paidServices.sparkBoard.qty);
      _.set(initResults, 'careTrial.enabled', preset.care);
      _.set(initResults, 'careTrial.paid', paidServices.care.qty);
      _.set(initResults, 'careTrial.details.quantity', preset.careLicenseValue || paidServices.care.qty);
      if (isEditTrial()) {
        _.set(initResults, 'contextTrial.enabled', results.tcHasService);
        _.set(initResults, 'preset.context', results.tcHasService);
        _.set(initResults, 'details.licenseCount', preset.licenseCount);
        _.set(initResults, 'details.licenseDuration', preset.licenseDuration);
      }
      return initResults;
    }


    // save trial helpers

    function saveTrialNotifySuccessAndCallback(addNumbersCallback, customerName, customerOrgId) {
      var notifictionSuccessText = isNewTrial() ? 'trialModal.addSuccess' : 'trialModal.editSuccess';
      sendToAnalytics(Analytics.sections.TRIAL.eventNames.FINISH);
      //edit
      Notification.success(notifictionSuccessText, {
        customerName: customerName
      });

      if (_.isFunction(addNumbersCallback)) {
        return addNumbersCallback(customerOrgId).catch(_.noop); //don't throw an error
      }

    }

    function saveTrialContext(customerOrgId) {
      //edit
      var hasValueChanged = !isExistingOrg() ? vm.contextTrial.enabled : (vm.preset.context !== vm.contextTrial.enabled);
      var errorAddResponse = isNewTrial() ? 'trialModal.startTrialContextServiceError' : 'trialModal.editTrialContextServiceEnableError';
      if (!hasValueChanged) {
        return;
      }
      if (vm.contextTrial.enabled) {
        return TrialContextService.addService(customerOrgId).catch(function (response) {
          Notification.errorResponse(response, errorAddResponse);
          return $q.reject(response);
        });
      } else if (isEditTrial()) {
        return TrialContextService.removeService(customerOrgId).catch(function (response) {
          Notification.errorResponse(response, 'trialModal.editTrialContextServiceDisableError');
          return $q.reject(response);
        });
      }
      return;
    }

    function saveTrialPstn(customerOrgId, customerName, customerEmail) {
      var hasValueChanged = !isExistingOrg() ? vm.callTrial.enabled : (vm.callTrial.enabled && !vm.preset.call);
      if (!hasValueChanged) {
        return;
      }
      return HuronCustomer.create(customerOrgId, customerName, customerEmail)
        .catch(function (response) {
          Notification.errorResponse(response, 'trialModal.squareducError');
          return $q.reject(response);
        }).then(function () {
          if (vm.pstnTrial.enabled) {
            return TrialPstnService.createPstnEntity(customerOrgId, customerName);
          }
        });
    }
  }
})();
