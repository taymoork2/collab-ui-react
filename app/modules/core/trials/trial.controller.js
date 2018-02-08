(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialCtrl', TrialCtrl);

  /* @ngInject */
  function TrialCtrl($q, $state, $scope, $stateParams, $translate, $window, Analytics, Authinfo, Config, HuronCustomer, FeatureToggleService, Notification, Orgservice, TrialContextService, TrialDeviceService, TrialPstnService, TrialService, HuronCompassService) {
    var vm = this;
    vm.careTypes = {
      K1: 1,
      K2: 2,
    };

    vm.validationMessages = {
      general: {
        required: $translate.instant('common.invalidRequired'),
        email: $translate.instant('common.invalidEmail'),
        trialUniqueAsyncValidator: '',
      },
      roomSystem: {
        max: $translate.instant('partnerHomePage.invalidTrialRoomSystemQuantity'),
        number: $translate.instant('partnerHomePage.invalidTrialRoomSystemQuantity'),
        required: $translate.instant('common.invalidRequired'),
      },
      licenseNumber: {
        max: $translate.instant('partnerHomePage.invalidTrialLicenseCount'),
        min: $translate.instant('partnerHomePage.careLicenseCountExceedsTotalCount'),
        number: $translate.instant('partnerHomePage.invalidTrialLicenseCount'),
        required: $translate.instant('common.invalidRequired'),
      },
      care: {
        max: $translate.instant('partnerHomePage.invalidTrialCareQuantity'),
        required: $translate.instant('common.invalidRequired'),
        number: $translate.instant('partnerHomePage.invalidTrialCareQuantity'),
      },
    };

    vm.validationData = {
      roomSystemMax: 20,
      trialLicenseMax: 1000,
      careMax: 50,
    };

    var _careDefaultQuantity = 15;
    var _roomSystemDefaultQuantity = 5;
    var _licenseCountDefaultQuantity = 0;
    var _trialDurationDefaultLength = 30;
    vm.licenseDurationOptions = [30, 60, 90];
    vm.debounceTimeout = 2000;

    vm.currentTrial = ($stateParams.currentTrial) ? _.cloneDeep($stateParams.currentTrial) : {};
    vm.stateDetails = ($stateParams.details) ? _.cloneDeep($stateParams.details) : {};

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
    vm.showBasicCare = false;
    vm.showAdvanceCare = false;
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
    vm.advanceCareTrial = vm.trialData.trials.advanceCareTrial;
    vm.hasUserServices = hasUserServices;
    _licenseCountDefaultQuantity = vm.trialData.details.licenseCount;

    var preset = (!isExistingOrg()) ? getNewOrgPreset() : getExistingOrgPreset();
    var paidServices = (!isExistingOrg()) ? {} : getPaidServices();
    _.extend(vm.paidServices, paidServices);
    _.extend(vm.preset, preset);
    var stateDefaults = (isNewTrial()) ? getAddModeStateDefaults() : getEditModeStateDefaults();
    _.extend(vm.stateDefaults, stateDefaults);

    vm.trialStates = [{
      name: 'trial.webex',
      trials: [vm.webexTrial],
      enabled: true,
    }, {
      name: 'trial.call',
      trials: [vm.callTrial, vm.roomSystemTrial, vm.sparkBoardTrial],
      enabled: true,
    }, {
      name: 'trial.pstnDeprecated',
      trials: [vm.pstnTrial],
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
    vm.navOrder = ['trial.info', 'trial.webex', 'trial.pstnDeprecated', 'trial.emergAddress', 'trial.call'];
    vm.navStates = ['trial.info'];

    vm.isNewTrial = isNewTrial;
    vm.isEditTrial = isEditTrial;
    vm.isExistingOrg = isExistingOrg;
    vm.isAddTrialValid = isAddTrialValid;
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
    vm.onTrialTermsChanged = onTrialTermsChanged;
    vm.isLoading = isLoading;
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
      getCareMaxLicenseCount: getCareMaxLicenseCount,
      getMinUserLicenseRequired: getMinUserLicenseRequired,
      saveTrialPstn: saveTrialPstn,
      saveTrialContext: saveTrialContext,
      getNewOrgInitResults: getNewOrgInitResults,
      getExistingOrgInitResults: getExistingOrgInitResults,
      getPaidLicense: getPaidLicense,
      hasOfferType: hasOfferType,
      getPaidServicesForDisplay: getPaidServicesForDisplay,
    };
    vm.devicesModal = _.find(vm.trialStates, {
      name: 'trial.call',
    });
    vm.setDefaultCountry = setDefaultCountry;

    vm.hasRegisteredContextService = hasRegisteredContextService;

    //watch room systems trial 'enabled' for quantity
    $scope.$watch(function () {
      return vm.roomSystemTrial.enabled;
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.roomSystemTrial.details.quantity = newValue ? _roomSystemDefaultQuantity : 0;
      }
    });

    //watch sparkboard 'enabled' for quantity
    $scope.$watch(function () {
      return vm.sparkBoardTrial.enabled;
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm.sparkBoardTrial.details.quantity = newValue ? _roomSystemDefaultQuantity : 0;
      }
    });
    // algendel: for care and advanced care the quantity is set by 'disabled expression' functions.
    // We can just move the code that sets the quantity into the watch the same way we do with the others
    // The only downside to that is difficulty testing the $watch vs. the function.

    //watch care 'enabled' for quantity
    $scope.$watch(function () {
      return vm.careTrial.enabled;
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm._helpers.careLicenseInputDisabledExpression();
      }
    });

    //watch advance care 'enabled' for quantity
    $scope.$watch(function () {
      return vm.advanceCareTrial.enabled;
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        vm._helpers.advanceCareLicenseInputDisabledExpression();
      }
    });

    //watch hasUserServices for licence quantity
    $scope.$watch(function () {
      return hasUserServices();
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        if (newValue) {
          if (vm.details.licenseCount === 0) {
            vm.details.licenseCount = vm.stateDefaults.licenseCount;
          }
        } else {
          vm.details.licenseCount = 0;
        }
      }
    });

    init();
    ///////////////////////

    function init() {
      vm.loading = true;
      var isTestOrg = false;
      vm.details.licenseCount = vm.stateDefaults.licenseCount;
      var overrideTestOrg = false;
      vm.hasCallEntitlement = Authinfo.isSquaredUC() || vm.isNewTrial();
      vm.pstnTrial.enabled = vm.hasCallEntitlement;
      var promises = {
        atlasDarling: FeatureToggleService.atlasDarlingGetStatus(),
        ftCareTrials: FeatureToggleService.atlasCareTrialsGetStatus(),
        ftAdvanceCareTrials: FeatureToggleService.atlasCareInboundTrialsGetStatus(),
        ftShipDevices: FeatureToggleService.atlasTrialsShipDevicesGetStatus(), //TODO add true for shipping testing.
        adminOrg: Orgservice.getAdminOrgAsPromise().catch(function () { return false; }),
        huronPstn: FeatureToggleService.supports(FeatureToggleService.features.huronPstn),
        hybridCare: FeatureToggleService.supports(FeatureToggleService.features.hybridCare),
      };
      if (!vm.isNewTrial()) {
        promises.tcHasService = TrialContextService.trialHasService(vm.currentTrial.customerOrgId);
        if (vm.pstnTrial.enabled) {
          promises.hasSetupPstn = TrialPstnService.checkForPstnSetup(vm.currentTrial.customerOrgId).catch(function () { return false; });
        }
      }
      $q.all(promises)
        .then(function (results) {
          vm.showRoomSystems = true;
          vm.showContextServiceTrial = true;
          vm.showBasicCare = results.ftCareTrials;
          vm.showAdvanceCare = results.ftAdvanceCareTrials;
          vm.showCare = vm.showBasicCare || vm.showAdvanceCare;
          vm.sbTrial = results.atlasDarling;
          vm.atlasTrialsShipDevicesEnabled = results.ftShipDevices;
          overrideTestOrg = results.ftShipDevices;
          isTestOrg = _.get(results.adminOrg, 'data.isTestOrg', false);
          vm.canSeeDevicePage = !isTestOrg || overrideTestOrg;
          vm.devicesModal.enabled = vm.canSeeDevicePage;
          vm.defaultCountryList = results.huronCountryList;
          vm.huronPstn = results.huronPstn;
          vm.hybridCare = results.hybridCare;

          if (vm.huronPstn) {
            vm.navOrder = ['trial.info', 'trial.webex', 'trial.pstn', 'trial.call'];
          }

          var initResults = (vm.isExistingOrg()) ? getExistingOrgInitResults(results, vm.hasCallEntitlement, vm.preset, vm.paidServices) : getNewOrgInitResults(results, vm.hasCallEntitlement, vm.stateDefaults);
          _.merge(vm, initResults);
          // TODO: algendel
          // - remove this once the backend migration is verified complete (see: timtrinh)
          // - the old 'COLLAB' offer trials have been changed so there is no need for this function any more
          // - its description was as follows:
          //   > If Webex Trials are enabled, we switch out offerType Collab for Message
          //   > This requires changing the label it contains as well
          // updateTrialService(_messageTemplateOptionId);
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
          vm.loading = false;
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
        enabled: true,
      });
      return result;
    }

    function isPstn() {
      if (vm.preset.pstn) {
        return false;
      }
      return ((!vm.preset.call && hasEnabledCallTrial())
      || (!vm.preset.roomSystems && hasEnabledRoomSystemTrial())
      || (!vm.preset.sparkBoard && hasEnabledSparkBoardTrial()));
    }

    function toggleTrial() {
      if ((!vm.callTrial.enabled && !vm.roomSystemTrial.enabled && !vm.sparkBoardTrial.enabled) || _.get(vm.details.country, 'id') === 'N/A') {
        vm.pstnTrial.enabled = false;
      }

      if ((vm.callTrial.enabled || vm.roomSystemTrial.enabled || vm.sparkBoardTrial.enabled) && vm.hasCallEntitlement && !vm.pstnTrial.skipped && _.get(vm.details.country, 'id') !== 'N/A') {
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
      setViewState('trial.pstn', isPstn() && (_.get(vm.details.country, 'id') !== 'N/A'));
      setViewState('trial.emergAddress', TrialPstnService.getCarrierCapability('E911'));

      if (vm.huronPstn) {
        setViewState('trial.pstn', isPstn() && (_.get(vm.details.country, 'id') !== 'N/A'));
      } else {
        setViewState('trial.pstnDeprecated', isPstn() && (_.get(vm.details.country, 'id') !== 'N/A'));
      }

      addRemoveStates();
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
      cancelCustomer();
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
            customerName: vm.details.customerName,
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
            customerOrgId: vm.customerOrgId,
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
        id: configOption,
      });
    }


    function getPaidLicense(licenseType, offerNames, label) {
      var result = {
        label: label,
        qty: 0,
        licenseItems: [],
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
              qty: license.volume,
            });
          }
        }
        return result;
      }, result);

      return licenseTypeAggregate;
    }


    function setViewState(modalStage, value) {
      _.find(vm.trialStates, {
        name: modalStage,
      }).enabled = value;
    }

    function isProceedDisabled() {
      if (!vm.details.validLocation) {
        return true;
      }
      // ALINA PR note: change for adding to purchased. LicenseCount will be different
      var checks = [
        hasEnabledAnyTrial(vm, vm.preset),
        vm.preset.context !== vm.contextTrial.enabled,
        vm.preset.countryCode !== vm.details.country,
        vm.preset.roomSystems && (vm.preset.roomSystemsValue !== vm.roomSystemTrial.details.quantity),
        vm.preset.sparkBoard && (vm.preset.sparkBoardValue !== vm.sparkBoardTrial.details.quantity),
        vm.preset.care && (vm.preset.careLicenseValue !== vm.careTrial.details.quantity),
        vm.preset.advanceCare && (vm.preset.advanceCareLicenseValue !== vm.advanceCareTrial.details.quantity),
        (vm.preset.licenseCount !== vm.details.licenseCount) && !(isNewTrial() && isExistingOrg()),
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
      var trial = vmSparkBoardTrial || vm.sparkBoardTrial;
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

    function hasRegisteredContextService(contextFormSection) {
      return vm.contextTrial.enabled && contextFormSection.$pristine;
    }

    function hasService(service) {
      return service.enabled || service.paid > 0;
    }

    function messageOfferDisabledExpression() {
      if (!hasService(vm.messageTrial)) {
        vm.careTrial.enabled = false;
        vm.advanceCareTrial.enabled = false;
      }
      return !hasService(vm.messageTrial);
    }

    function callOfferDisabledExpression() {
      if (!hasService(vm.callTrial)) {
        vm.careTrial.enabled = false;
        vm.advanceCareTrial.enabled = false;
      }
      return !hasService(vm.callTrial);
    }

    function careLicenseInputDisabledExpression() {
      vm.careTrial.details.quantity = (!vm.careTrial.enabled) ? 0 : (vm.careTrial.details.quantity || _careDefaultQuantity);
      return !vm.careTrial.enabled;
    }

    function advanceCareLicenseInputDisabledExpression() {
      vm.advanceCareTrial.details.quantity = (!vm.advanceCareTrial.enabled) ? 0 : (vm.advanceCareTrial.details.quantity || _careDefaultQuantity);
      return !vm.advanceCareTrial.enabled;
    }

    function getCareLicenseCount(careTrial) {
      var paidCareTrialQuantity = _.get(careTrial, 'paid', 0);
      return careTrial.enabled ? careTrial.details.quantity : paidCareTrialQuantity;
    }

    function getMinUserLicenseRequired() {
      var totalCare = getCareLicenseCount(vm.careTrial) + getCareLicenseCount(vm.advanceCareTrial);
      var paidMessageLicenseCount = _.get(vm.messageTrial, 'paid', 0);
      // Has no user services but might have purchased message licenses.
      // Care should validate against those licenses so 0 is OK.
      // If care licenses number > purchased Message licenses the error should be in care license validation.
      if (!vm.hasUserServices()) {
        return 0;
      }
      // Has user services in trial
      // If no message purchased should be > total care and > 0
      if (paidMessageLicenseCount === 0) {
        return Math.max(totalCare, 1);
      }
      // Has purchased message
      return 1; // Care will validate against purchased message licenses.
    }

    function getCareMaxLicenseCount(careType) {
      var careTrial = (careType === vm.careTypes.K2) ? vm.careTrial : vm.advanceCareTrial;
      var paidMessageLicenseCount = _.get(vm.messageTrial, 'paid', 0);
      var messageLicenseCount = (vm.messageTrial.enabled) ? vm.details.licenseCount : paidMessageLicenseCount;
      var max = messageLicenseCount - getCareLicenseCount(careTrial);
      return Math.min(max, vm.validationData.careMax);
    }

    // TODO: this can be refactored as it is mostly a dupe of 'TrialAddCtrl.launchCustomerPortal'
    function launchCustomerPortal() {
      var customerOrgId = vm.isEditTrial() ? vm.currentTrial.customerOrgId : vm.customerOrgId;

      sendToAnalytics(Analytics.eventNames.YES);
      $window.open($state.href('login', {
        customerOrgId: customerOrgId,
      }));
      $state.modal.close();
      cancelCustomer();
    }

    function showDefaultFinish() {
      return !hasEnabledWebexTrial(vm.webexTrial, vm.preset);
    }

    function onTrialTermsChanged() {
      if (vm.isEditTrial()) {
        vm.licenseCountChanged = true;
        isProceedDisabled();
      }
    }

    function canAddDevice() {
      var stateDetails = vm.stateDetails.details;
      var roomSystemTrialEnabled = vm.roomSystemTrial.enabled;
      //TODO: add spark board
      var callTrialEnabled = vm.callTrial.enabled;
      var canSeeDevicePage = vm.canSeeDevicePage;
      return TrialDeviceService.canAddDevice(stateDetails, roomSystemTrialEnabled, callTrialEnabled, canSeeDevicePage);
    }

    function cancelCustomer() {
      HuronCompassService.setIsCustomer(false);
      HuronCompassService.setCustomerBaseDomain();
    }

    function cancelModal() {
      cancelCustomer();
      $state.modal.dismiss();
      sendToAnalytics(Analytics.eventNames.CANCEL_MODAL);
    }

    function isLoading(form) {
      return vm.loading || !_.isNil(form.$pending);
    }

    function sendToAnalytics(eventName, extraData) {
      Analytics.trackTrialSteps(eventName, vm.trialData, extraData);
    }

    function isAddTrialValid(isFormValid) {
      return vm.details.validLocation && (isFormValid && vm.hasTrial());
    }


    function getNewOrgPreset() {
      return {};
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
        advanceCare: hasOfferType(Config.offerTypes.advanceCare),
        careLicenseValue: _.get(findOffer(Config.offerTypes.care), 'licenseCount', 0),
        advanceCareLicenseValue: _.get(findOffer(Config.offerTypes.advanceCare), 'licenseCount', 0),
        context: false, // we don't know this yet, so default to false
        countryCode: hasOfferType(Config.trials.call, Config.offerTypes.call) || hasOfferType(Config.offerTypes.roomSystems) ? TrialPstnService.getCountryCode() : '',
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
        advanceCare: getPaidLicense(Config.licenseTypes.ADVANCE_CARE, undefined, $translate.instant('trials.advanceCare')),
        context: getPaidLicense(Config.licenseTypes.CONTEXT, undefined, $translate.instant('trials.context')),
      };
    }

    function getAddModeStateDefaults() {
      return {
        licenseCount: _licenseCountDefaultQuantity,
        trialDuration: _trialDurationDefaultLength,
        roomSystemsDefault: _roomSystemDefaultQuantity,
        sparkBoardDefault: _roomSystemDefaultQuantity,
        careDefault: _careDefaultQuantity,
        advanceCareDefault: _careDefaultQuantity,
      };
    }

    function getEditModeStateDefaults() {
      var stateDefaults = getAddModeStateDefaults();
      stateDefaults.trialDuration = vm.currentTrial.duration;
      return stateDefaults;
    }

    function getPaidServicesForDisplay(myOrgId, myOrgName) {
      var result = _.chain(vm.paidServices)
        .filter(function (service) {
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
      _.set(initResults, 'messageTrial.enabled', true);
      _.set(initResults, 'roomSystemTrial.details.quantity', stateDefaults.roomSystemsDefault);
      _.set(initResults, 'sparkBoardTrial.details.quantity', stateDefaults.sparkBoardDefault);
      _.set(initResults, 'careTrial.enabled', results.ftCareTrials);
      _.set(initResults, 'careTrial.details.quantity', stateDefaults.careDefault);
      _.set(initResults, 'advanceCareTrial.enabled', results.ftAdvanceCareTrials);
      _.set(initResults, 'advanceCareTrial.details.quantity', stateDefaults.advanceCareDefault);
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
      _.set(initResults, 'advanceCareTrial.enabled', preset.advanceCare);
      _.set(initResults, 'advanceCareTrial.paid', paidServices.advanceCare.qty);
      _.set(initResults, 'advanceCareTrial.details.quantity', preset.advanceCareLicenseValue || paidServices.advanceCare.qty);
      if (isEditTrial()) {
        _.set(initResults, 'contextTrial.enabled', results.tcHasService);
        _.set(initResults, 'preset.context', results.tcHasService);
        _.set(initResults, 'details.licenseCount', preset.licenseCount);
        _.set(initResults, 'details.licenseDuration', preset.licenseDuration);
        if (vm.pstnTrial.enabled) {
          _.set(initResults, 'preset.pstn', results.hasSetupPstn);
        }
        if (initResults.callTrial.enabled || initResults.roomSystemTrial.enabled || initResults.sparkBoardTrial.enabled) {
          _.set(initResults, 'details.country', preset.countryCode);
        }
      }
      return initResults;
    }

    // save trial helpers

    function saveTrialNotifySuccessAndCallback(addNumbersCallback, customerName, customerOrgId) {
      var notifictionSuccessText = isNewTrial() ? 'trialModal.addSuccess' : 'trialModal.editSuccess';
      sendToAnalytics(Analytics.sections.TRIAL.eventNames.FINISH);
      //edit
      Notification.success(notifictionSuccessText, {
        customerName: customerName,
      });

      if (_.isFunction(addNumbersCallback)) {
        return addNumbersCallback(customerOrgId).catch(_.noop); //don't throw an error
      }
    }

    function saveTrialContext(customerOrgId) {
      //edit
      var hasValueChanged = !isExistingOrg() ? vm.contextTrial.enabled : (vm.preset.context !== vm.contextTrial.enabled);
      var errorAddResponse = isNewTrial() ? 'trialModal.startTrialContextServiceError' : 'trialModal.editTrialContextServiceEnableError';
      var orgAlreadyRegistered = 'ORGANIZATION_REGISTERED_USING_API';

      if (!hasValueChanged) {
        return;
      }
      if (vm.contextTrial.enabled) {
        return TrialContextService.addService(customerOrgId).catch(function (response) {
          // ignore only the "org already registered" error
          if (_.get(response, 'data.error.statusText') === orgAlreadyRegistered) {
            return;
          }

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
      var newOrgCondition = vm.callTrial.enabled || vm.roomSystemTrial.enabled || vm.sparkBoardTrial.enabled || (vm.careTrial.enabled && vm.hybridCare);
      var existingOrgCondition = ((vm.callTrial.enabled && !vm.preset.call) || (vm.roomSystemTrial.enabled && !vm.preset.roomSystems) || (vm.sparkBoardTrial.enabled && !vm.preset.sparkBoardTrial) || (vm.careTrial.enabled && !vm.preset.care && vm.hybridCare));
      var hasValueChanged = !isExistingOrg() ? newOrgCondition : existingOrgCondition;
      var countryCode;

      if (!hasValueChanged) {
        return;
      }

      //During 'Edit Trial', setDefaultCountry method is not called
      //However, the TrialPstnService may have the country code set prior to
      //trial code being instantiated
      if (country && (_.get(country, 'id') !== 'N/A')) {
        countryCode = country.id;
      } else if (_.get(country, 'id') === 'N/A') {
        countryCode = 'US';
      } else {
        countryCode = TrialPstnService.getCountryCode();
      }

      return HuronCustomer.create(customerOrgId, customerName, countryCode, customerEmail)
        .catch(function (response) {
          Notification.errorResponse(response, 'trialModal.squareducError');
          return $q.reject(response);
        }).then(function () {
          if (vm.pstnTrial.enabled && !vm.preset.pstn) {
            return TrialPstnService.createPstnEntityV2(customerOrgId, customerName);
          }
        });
    }

    function setDefaultCountry(country) {
      TrialPstnService.setCountryCode(country.id);
      vm.details.country = country;
    }
  }
})();
