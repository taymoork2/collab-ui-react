(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialCtrl', TrialCtrl);

  /* @ngInject */
  function TrialCtrl($q, $state, $scope, $stateParams, $translate, $window, Analytics, Authinfo, Config, HuronCountryService, HuronCustomer, FeatureToggleService, Notification, Orgservice, TrialContextService, TrialDeviceService, TrialPstnService, TrialService, ValidationService) {
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
    vm.paidServicesForDisplay = null;

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
        label: $translate.instant('trials.call'),
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
          return (vm.messageTrial.enabled && vm.callTrial.enabled); // Since, it depends on Message and Call Offer
        },
        'templateOptions.disabled': function () {
          return messageOfferDisabledExpression() || callOfferDisabledExpression() || vm.preset.care;
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
            return validateCareLicense(vm.careTrial.details.quantity);
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
    vm.getNextState = getNextState;
    vm.hasTrial = hasTrial;
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
      saveTrialPstn: saveTrialPstn,
      saveTrialContext: saveTrialContext,
      getNewOrgInitResults: getNewOrgInitResults,
      getExistingOrgInitResults: getExistingOrgInitResults,
      getPaidLicense: getPaidLicense,
      hasOfferType: hasOfferType,
      getPaidServicesForDisplay: getPaidServicesForDisplay
    };
    vm.devicesModal = _.find(vm.trialStates, {
      name: 'trial.call'
    });
    vm.setDefaultCountry = setDefaultCountry;

    init();

    ///////////////////////

    function init() {
      var isTestOrg = false;
      var overrideTestOrg = false;
      vm.hasCallEntitlement = Authinfo.isSquaredUC() || vm.isNewTrial();
      var promises = {
        atlasDarling: FeatureToggleService.atlasDarlingGetStatus(),
        ftCareTrials: FeatureToggleService.atlasCareTrialsGetStatus(),
        ftShipDevices: FeatureToggleService.atlasTrialsShipDevicesGetStatus(),  //TODO add true for shipping testing.
        adminOrg: Orgservice.getAdminOrgAsPromise().catch(function () { return false; }),
        huronCountryList: getCountryList(),
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
          vm.atlasTrialsShipDevicesEnabled = results.ftShipDevices;
          vm.pstnTrial.enabled = vm.hasCallEntitlement;
          overrideTestOrg = results.ftShipDevices;
          isTestOrg = _.get(results.adminOrg, 'data.isTestOrg', false);
          vm.canSeeDevicePage = !isTestOrg || overrideTestOrg;
          vm.devicesModal.enabled = vm.canSeeDevicePage;
          vm.defaultCountryList = results.huronCountryList;
          hasSetupPstn(vm.currentTrial.customerOrgId);
          var initResults = (vm.isExistingOrg()) ? getExistingOrgInitResults(results, vm.hasCallEntitlement, vm.preset, vm.paidServices) : getNewOrgInitResults(results, vm.hasCallEntitlement, vm.stateDefaults);
          _.merge(vm, initResults);
          updateTrialService(_messageTemplateOptionId);
          vm.paidServicesForDisplay = getPaidServicesForDisplay(Authinfo.getOrgId(), Authinfo.getOrgName());
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

    function getCountryList() {
      return HuronCountryService.getCountryList()
        .catch(function () {
          return [];
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

    function isPstn() {
      return (((!vm.preset.call && hasEnabledCallTrial()) || (!vm.preset.roomSystems && hasEnabledRoomSystemTrial())) && !vm.preset.pstn);
    }

    function toggleTrial() {
      if (!vm.callTrial.enabled && !vm.roomSystemTrial.enabled && !vm.sparkBoardTrial.enabled) {
        vm.pstnTrial.enabled = false;
      }

      if ((vm.callTrial.enabled || vm.roomSystemTrial.enabled || vm.sparkBoardTrial.enabled) && vm.hasCallEntitlement && !vm.pstnTrial.skipped) {
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
      setViewState('trial.pstn', isPstn());
      setViewState('trial.emergAddress', isPstn());
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
          vm.customerOrgId = response.data.customerOrgId;
          return saveTrialPstn(vm.customerOrgId, response.data.customerName, response.data.customerEmail, vm.details.country);
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


    function getPaidLicense(licenseType, offerNames, label) {
      var result = {
        label: label,
        qty: 0,
        licenseItems: []
      };
      if (offerNames && !_.isArray(offerNames)) {
        offerNames = [offerNames];
      }
      //Iterate through the license list.
      // If found the matching license matched by licenseType and, if needed, offerName
      // Add quantity to aggregate.
      // If this license doesn't exist in the list (matched by orgId): add to array, otherwise: add quantity to the existing license

      var licenseTypeAggregate = _.reduce(vm.currentTrial.licenseList, function (sum, license) {
        if (license.licenseType === licenseType && !license.isTrial && (!offerNames || _.includes(offerNames, license.offerName))) {
          result.qty = result.qty + license.volume;
          var index = _.findIndex(result.licenseItems, { partnerOrgId: license.partnerOrgId });
          if (index > -1) {
            result.licenseItems[index].qty += license.volume;
          } else {
            result.licenseItems.push({
              partnerOrgId: license.partnerOrgId,
              label: label,
              qty: license.volume
            });
          }
        }
        return result;

      }, result);

      return licenseTypeAggregate;
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

    function hasService(service) {
      return service.enabled || service.paid > 0;
    }

    function messageOfferDisabledExpression() {
      if (!hasService(vm.messageTrial)) {
        vm.careTrial.enabled = false;
      }
      return !hasService(vm.messageTrial);
    }

    function callOfferDisabledExpression() {
      if (!hasService(vm.callTrial)) {
        vm.careTrial.enabled = false;
      }
      return !hasService(vm.callTrial);
    }

    function careLicenseInputDisabledExpression() {
      vm.careTrial.details.quantity = (!vm.careTrial.enabled) ? 0 : (vm.careTrial.details.quantity || _careDefaultQuantity);
      return !vm.careTrial.enabled;
    }

    function validateCareLicense($viewValue, $modelValue) {
      //if message in trial -- use licenseCount -- otherwise use purchased quantity
      var messageLicenseCount = (vm.messageTrial.enabled) ? vm.details.licenseCount : vm.messageTrial.paid;
      return !vm.careTrial.enabled || ValidationService.trialCareQuantity(
        $viewValue, $modelValue, messageLicenseCount);
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
        roomSystemsValue: _.get(findOffer(Config.offerTypes.roomSystems), 'licenseCount', 0),
        sparkBoard: hasOfferType(Config.offerTypes.sparkBoard),
        sparkBoardValue: _.get(findOffer(Config.offerTypes.sparkBoard), 'licenseCount', 0),
        licenseDuration: _.get(vm, 'currentTrial.duration', 0),
        care: hasOfferType(Config.offerTypes.care),
        careLicenseValue: _.get(findOffer(Config.offerTypes.care), 'licenseCount', 0),
        context: false // we don't know this yet, so default to false
      };
    }


    function getPaidServices() {
      return {
        message: getPaidLicense(Config.licenseTypes.MESSAGING, undefined, $translate.instant('trials.message')),
        meeting: getPaidLicense(Config.licenseTypes.CONFERENCING, [undefined, Config.offerCodes.CF], $translate.instant('trials.meeting')),
        webex: getPaidLicense(Config.licenseTypes.CONFERENCING, [Config.offerCodes.EE, Config.offerCodes.MC, Config.offerCodes.SC, Config.offerCodes.TC, Config.offerCodes.EC, Config.offerCodes.CMR], $translate.instant('trials.webex')),
        call: getPaidLicense(Config.licenseTypes.COMMUNICATION, undefined, $translate.instant('trials.call')),
        roomSystems: getPaidLicense(Config.licenseTypes.SHARED_DEVICES, Config.offerCodes.SD, $translate.instant('trials.roomSystem')),
        sparkBoard: getPaidLicense(Config.licenseTypes.SHARED_DEVICES, Config.offerCodes.SB, $translate.instant('trials.sparkBoardSystem')),
        care: getPaidLicense(Config.licenseTypes.CARE, undefined, $translate.instant('trials.care')),
        context: getPaidLicense(Config.licenseTypes.CONTEXT, undefined, $translate.instant('trials.context')),
      };
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

    function getPaidServicesForDisplay(myOrgId, myOrgName) {
      var result = _.chain(vm.paidServices).filter(function (service) {
        return service.qty > 0;
      })
      .map('licenseItems')
      .flatten()
      .map(function (service) {
        if (service.partnerOrgId !== myOrgId) {
          service.partnerOrg = $translate.instant('trials.anotherPartner');
        } else {
          service.partnerOrg = myOrgName;
        }
        return service;
      })
      .groupBy('partnerOrg')
      .map(function (value, key) {
        return { org: key, services: value };
      })
      .value();
      // sort so that user's org is on top.
      var myOrgsPaidServices = _.remove(result, { org: myOrgName });
      if (myOrgsPaidServices.length) {
        result.unshift(myOrgsPaidServices[0]);
      }
      return result;
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
      _.set(initResults, 'sparkBoardTrial.details.quantity', preset.sparkBoardValue || paidServices.sparkBoard.qty);
      _.set(initResults, 'careTrial.enabled', preset.care);
      _.set(initResults, 'careTrial.paid', paidServices.care.qty);
      _.set(initResults, 'careTrial.details.quantity', preset.careLicenseValue || paidServices.care.qty);
      if (isEditTrial()) {
        _.set(initResults, 'contextTrial.enabled', results.tcHasService);
        _.set(initResults, 'preset.context', results.tcHasService);
        _.set(initResults, 'details.licenseCount', preset.licenseCount);
        _.set(initResults, 'details.licenseDuration', preset.licenseDuration);
        hasSetupPstn(vm.currentTrial.customerOrgId);
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
    }

    function saveTrialPstn(customerOrgId, customerName, customerEmail, country) {
      var newOrgCondition = vm.callTrial.enabled || vm.roomSystemTrial.enabled || vm.sparkBoardTrial.enabled;
      var existingOrgCondition = ((vm.callTrial.enabled && !vm.preset.call) || (vm.roomSystemTrial.enabled && !vm.preset.roomSystems));
      var hasValueChanged = !isExistingOrg() ? newOrgCondition : existingOrgCondition;

      if (!hasValueChanged) {
        return;
      }
      return HuronCustomer.create(customerOrgId, customerName, country, customerEmail)
        .catch(function (response) {
          Notification.errorResponse(response, 'trialModal.squareducError');
          return $q.reject(response);
        }).then(function () {
          if (vm.pstnTrial.enabled && !vm.preset.pstn) {
            return TrialPstnService.createPstnEntityV2(customerOrgId, customerName);
          }
        });
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

    function setDefaultCountry(country) {
      vm.details.country = country;
    }
  }
})();
