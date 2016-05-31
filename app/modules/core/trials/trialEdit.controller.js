(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialEditCtrl', TrialEditCtrl);

  /* @ngInject */
  function TrialEditCtrl($q, $state, $scope, $stateParams, $translate, $window, Authinfo, TrialService, Notification, Config, HuronCustomer, ValidationService, FeatureToggleService, TrialDeviceService, TrialPstnService, Orgservice) {
    var vm = this;

    vm.currentTrial = angular.copy($stateParams.currentTrial);
    vm.trialDetails = {};
    vm.stateDetails = angular.copy($stateParams.details);

    vm.customerOrgId = undefined;

    vm.showWebex = false;
    vm.showRoomSystems = false;

    var _messageTemplateOptionId = 'messageTrial';

    vm.trialData = TrialService.getData();
    vm.details = vm.trialData.details;
    vm.messageTrial = vm.trialData.trials.messageTrial;
    vm.meetingTrial = vm.trialData.trials.meetingTrial;
    vm.webexTrial = vm.trialData.trials.webexTrial;
    vm.callTrial = vm.trialData.trials.callTrial;
    vm.roomSystemTrial = vm.trialData.trials.roomSystemTrial;
    vm.pstnTrial = vm.trialData.trials.pstnTrial;
    vm.setDeviceModal = setDeviceModal;

    vm.preset = {
      licenseCount: _.get(vm, 'currentTrial.licenses', 0),
      message: hasOfferType(Config.trials.message) || hasOfferType(Config.offerTypes.message),
      meeting: hasOfferType(Config.trials.message) || hasOfferType(Config.offerTypes.meeting) || hasOfferType(Config.offerTypes.meetings),
      webex: hasOfferType(Config.trials.meeting) || hasOfferType(Config.offerTypes.meetings) || hasOfferType(Config.offerTypes.webex),
      call: hasOfferType(Config.trials.call) || hasOfferType(Config.offerTypes.call),
      roomSystems: hasOfferType(Config.offerTypes.roomSystems),
      roomSystemsValue: _.get(findOffer(Config.offerTypes.roomSystems), 'licenseCount', 0),
      licenseDuration: _.get(vm, 'currentTrial.duration', 0)
    };

    vm.details.licenseCount = vm.preset.licenseCount;
    vm.details.licenseDuration = vm.preset.licenseDuration;
    vm.roomSystemTrial.details.quantity = vm.preset.roomSystemsValue;

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

    vm.individualServices = [{
      model: vm.details,
      key: 'licenseCount',
      type: 'input',

      className: 'columns medium-12 license-count',
      templateOptions: {
        label: $translate.instant('siteList.licenseCount'),
        labelClass: 'columns medium-6',
        inputClass: 'columns medium-3',
        type: 'number',
        required: true,
      },
      validators: {
        count: {
          expression: function ($viewValue, $modelValue) {
            return ValidationService.trialLicenseCount($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialLicenseCount');
          },
        },
      },
    }, {
      // Message Trial
      model: vm.messageTrial,
      key: 'enabled',
      type: 'checkbox',
      className: 'columns medium-12',
      templateOptions: {
        label: $translate.instant('trials.message'),
        id: _messageTemplateOptionId,
        class: 'columns medium-12 checkbox-group',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.message;
        },
      },
    }, {
      // Meeting Trial
      model: vm.meetingTrial,
      key: 'enabled',
      type: 'checkbox',
      className: 'columns medium-12',
      templateOptions: {
        label: $translate.instant('trials.meeting'),
        id: 'meetingTrial',
        class: 'columns medium-12 checkbox-group',
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
      className: 'columns medium-12 checkbox-group',
      templateOptions: {
        label: $translate.instant('trials.webex'),
        id: 'webexTrial',
        class: 'columns medium-12',
      },
      'hideExpression': function () {
        return !vm.showWebex;
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.preset.webex;
        },
      },
    }, {
      // Call Trial
      model: vm.callTrial,
      key: 'enabled',
      type: 'checkbox',
      className: 'columns medium-12 checkbox-group',
      templateOptions: {
        label: $translate.instant('trials.callUsOnly'),
        id: 'squaredUCTrial',
        class: 'columns medium-12',
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
        labelClass: 'columns medium-4',
        inputClass: 'columns medium-4',
        options: [30, 60, 90]
      },
    }];

    // Room Systems Trial
    vm.roomSystemFields = [{
      model: vm.roomSystemTrial,
      key: 'enabled',
      type: 'checkbox',
      className: "columns medium-12",
      templateOptions: {
        label: $translate.instant('trials.roomSysUsOnly'),
        id: 'trialRoomSystem',
        class: 'columns medium-12',
      },
      watcher: {
        listener: function (field, newValue, oldValue, scope, stopWatching) {
          if (newValue !== oldValue) {
            field.model.details.quantity = newValue ? 5 : 0;
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
      className: "columns medium-12 small-offset-1",
      templateOptions: {
        id: 'trialRoomSystemsAmount',
        inputClass: 'columns medium-4',
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
            return ValidationService.trialRoomSystemQuantity($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialRoomSystemQuantity');
          }
        }
      }
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
    vm._helpers = {
      hasEnabled: hasEnabled,
      hasEnabledMessageTrial: hasEnabledMessageTrial,
      hasEnabledMeetingTrial: hasEnabledMeetingTrial,
      hasEnabledWebexTrial: hasEnabledWebexTrial,
      hasEnabledCallTrial: hasEnabledCallTrial,
      hasEnabledRoomSystemTrial: hasEnabledRoomSystemTrial,
      hasEnabledAnyTrial: hasEnabledAnyTrial
    };

    init();

    ///////////////////////

    function init() {
      $q.all([
        FeatureToggleService.supports(FeatureToggleService.features.atlasCloudberryTrials),
        FeatureToggleService.supports(FeatureToggleService.features.atlasWebexTrials),
        FeatureToggleService.supports(FeatureToggleService.features.atlasDeviceTrials)
      ]).then(function (results) {
        // TODO: override atlasCloudberryTrials globally to true for now (US11974)
        //vm.showRoomSystems = results[0];
        //vm.roomSystemTrial.enabled = results[0] && vm.preset.roomSystems;
        vm.showRoomSystems = true;
        vm.roomSystemTrial.enabled = true && vm.preset.roomSystems;
        vm.webexTrial.enabled = results[1] && vm.preset.webex;
        vm.meetingTrial.enabled = vm.preset.meeting;
        vm.showWebex = results[1];
        vm.callTrial.enabled = vm.hasCallEntitlement && vm.preset.call;
        vm.messageTrial.enabled = vm.preset.message;
        vm.pstnTrial.enabled = vm.hasCallEntitlement;
        // TODO: override atlasDeviceTrials to show Ship devices to all partners
        //       and do not show to test orgs (US12063)
        //vm.canSeeDevicePage = results[2];
        setDeviceModal();

        if (vm.showWebex) {
          updateTrialService(_messageTemplateOptionId);
        }
      }).finally(function () {
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

        toggleTrial();
      });
    }

    // If Webex Trials are enabled, we switch out offerType Collab for Message
    // This requires changing the label it contains as well
    function updateTrialService(templateOptionsId) {
      var index = _.findIndex(vm.individualServices, function (individualService) {
        return individualService.templateOptions.id === templateOptionsId;
      });
      if (index) {
        switch (templateOptionsId) {
        case _messageTemplateOptionId:
          vm.individualServices[index].model.type = Config.offerTypes.message;
          vm.individualServices[index].templateOptions.label = $translate.instant('trials.message');
          break;
        }
      }
    }

    function toggleTrial() {
      if (!vm.callTrial.enabled) {
        vm.pstnTrial.enabled = false;
      }
      if (vm.callTrial.enabled && vm.hasCallEntitlement && !vm.pstnTrial.skipped) {
        vm.pstnTrial.enabled = true;
      }
      setViewState('trialEdit.call', canAddDevice());
      setViewState('trialEdit.webex', hasEnabledWebexTrial());
      setViewState('trialEdit.pstn', vm.pstnTrial.enabled);
      setViewState('trialEdit.emergAddress', vm.pstnTrial.enabled);

      addRemoveStates();
      _.forEach(vm.individualServices, function (service) {
        service.runExpressions();
      });
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

    function hasNextStep() {
      return !_.isUndefined(getNextState());
    }

    function finishSetup() {
      $state.go('trialEdit.finishSetup');
    }

    function previousStep() {
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
      $state.modal.close();
    }

    function editTrial(callback) {
      vm.loading = true;
      var custId = vm.currentTrial.customerOrgId;
      var trialId = vm.currentTrial.trialId;
      var showFinish = hasEnabledAnyTrial(vm, vm.preset);

      return TrialService.editTrial(custId, trialId)
        .catch(function (response) {
          vm.loading = false;
          Notification.error(response.data.message);
          return $q.reject();
        })
        .then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          if (vm.callTrial.enabled && !vm.preset.call) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function (response) {
                vm.loading = false;
                Notification.errorResponse(response, 'trialModal.squareducError');
                return $q.reject(response);
              }).then(function () {
                if (vm.pstnTrial.enabled) {
                  return TrialPstnService.createPstnEntity(vm.customerOrgId);
                }
              });
          }
        })
        .then(function () {
          vm.loading = false;
          angular.extend($stateParams.currentTrial, vm.currentTrial);
          Notification.success('trialModal.editSuccess', {
            customerName: vm.currentTrial.customerName
          });

          if (callback) {
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
        vm.preset.roomSystems && (vm.preset.roomSystemsValue !== vm.roomSystemTrial.details.quantity),
        vm.preset.licenseCount !== vm.details.licenseCount,
        vm.preset.licenseDuration !== vm.details.licenseDuration,
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

    function hasEnabledAnyTrial(vm, vmPreset) {
      // TODO: look into discrepancy for 'roomSystem' vs. 'roomSystems'
      return hasEnabledMessageTrial(vm.messageTrial, vmPreset) ||
        hasEnabledMeetingTrial(vm.meetingTrial, vmPreset) ||
        hasEnabledWebexTrial(vm.webexTrial, vmPreset) ||
        hasEnabledCallTrial(vm.callTrial, vmPreset) ||
        hasEnabledRoomSystemTrial(vm.roomSystemTrial, vmPreset);
    }

    // TODO: this can be refactored as it is mostly a dupe of 'TrialAddCtrl.launchCustomerPortal'
    function launchCustomerPortal() {
      $window.open($state.href('login_swap', {
        customerOrgId: vm.currentTrial.customerOrgId,
        customerOrgName: vm.currentTrial.customerName
      }));
      $state.modal.close();
    }

    function showDefaultFinish() {
      return !hasEnabledWebexTrial(vm.webexTrial, vm.preset);
    }

    function canAddDevice() {
      var stateDetails = vm.stateDetails.details;
      var roomSystemTrialEnabled = vm.roomSystemTrial.enabled;
      var callTrialEnabled = vm.callTrial.enabled;
      var canSeeDevicePage = vm.canSeeDevicePage;

      return TrialDeviceService.canAddDevice(stateDetails, roomSystemTrialEnabled, callTrialEnabled, canSeeDevicePage);
    }

    function setDeviceModal() {
      var overrideTestOrg = false;
      var isTestOrg = false;

      $q.all([
        FeatureToggleService.supports('atlasTrialsShipDevices'),
        Orgservice.getAdminOrg(_.noop)
      ]).then(function (results) {
        overrideTestOrg = results[0];
        if (results[1].data.success) {
          isTestOrg = results[1].data.isTestOrg;
        }
      }).finally(function () {
        // Display devices modal if not a test org or if toggle is set
        vm.canSeeDevicePage = !isTestOrg || overrideTestOrg;
      });
    }
  }
})();
