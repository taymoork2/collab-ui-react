(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialEditCtrl', TrialEditCtrl);

  /* @ngInject */
  function TrialEditCtrl($q, $state, $scope, $stateParams, $translate, Authinfo, TrialService, Notification, Config, HuronCustomer, ValidationService, FeatureToggleService, TrialDeviceService) {
    var vm = this;

    vm.currentTrial = angular.copy($stateParams.currentTrial);
    vm.trialDetails = {};
    vm.stateDetails = angular.copy($stateParams.details);

    vm.customerOrgId = undefined;

    vm.showMeeting = false;
    vm.canEditMessage = true;
    vm.canEditMeeting = true;
    vm.showRoomSystems = false;

    var _messageTemplateOptionId = 'messageTrial';

    vm.trialData = TrialService.getData();
    vm.details = vm.trialData.details;
    vm.messageTrial = vm.trialData.trials.messageTrial;
    vm.meetingTrial = vm.trialData.trials.meetingTrial;
    vm.callTrial = vm.trialData.trials.callTrial;
    vm.roomSystemTrial = vm.trialData.trials.roomSystemTrial;

    vm.preset = {
      licenseCount: _.get(vm, 'currentTrial.licenses', 0),
      message: hasOfferType(Config.trials.message) || hasOfferType(Config.offerTypes.message),
      meeting: hasOfferType(Config.trials.meeting) || hasOfferType(Config.offerTypes.meetings),
      call: hasOfferType(Config.trials.call) || hasOfferType(Config.offerTypes.call),
      roomSystems: hasOfferType(Config.offerTypes.roomSystems),
      roomSystemsValue: _.get(findOffer(Config.offerTypes.roomSystems), 'licenseCount', 0),
      licenseDuration: _.get(vm, 'currentTrial.duration', 0)
    };

    vm.details.licenseCount = vm.preset.licenseCount;
    vm.details.licenseDuration = vm.preset.licenseDuration;
    vm.roomSystemTrial.details.quantity = vm.preset.roomSystemsValue;

    vm.trialStates = [{
      'name': 'trialEdit.meeting',
      'trials': [vm.meetingTrial],
      'enabled': true,
    }, {
      'name': 'trialEdit.call',
      'trials': [vm.callTrial, vm.roomSystemTrial],
      'enabled': true,
    }, {
      'name': 'trialEdit.addNumbers',
      'trials': [vm.callTrial],
      'enabled': true,
    }];
    // Navigate trial modal in this order
    // TODO: addNumbers must be last page for now due to controller destroy.
    // This page "should" be refactored or become obsolete with PSTN
    vm.navOrder = ['trialEdit.info', 'trialEdit.meeting', 'trialEdit.call', 'trialEdit.addNumbers'];
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
        label: $translate.instant('trials.messageAndMeeting'),
        id: _messageTemplateOptionId,
        class: 'columns medium-12 checkbox-group',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.canEditMessage;
        },
      },
    }, {
      // Meeting Trial
      model: vm.meetingTrial,
      key: 'enabled',
      type: 'checkbox',
      className: 'columns medium-12 checkbox-group',
      templateOptions: {
        label: $translate.instant('trials.meeting'),
        id: 'meetingTrial',
        class: 'columns medium-12',
      },
      'hideExpression': function () {
        return !vm.showMeeting;
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return !vm.canEditMeeting;
        },
      },
    }, {
      // Call Trial
      model: vm.callTrial,
      key: 'enabled',
      type: 'checkbox',
      className: 'columns medium-12 checkbox-group',
      templateOptions: {
        label: $translate.instant('trials.call'),
        id: 'squaredUCTrial',
        class: 'columns medium-12',
      },
      'hideExpression': function () {
        return !vm.hasCallEntitlement();
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
      className: "columns medium-6",
      templateOptions: {
        label: $translate.instant('trials.roomSystem'),
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
      className: "columns medium-6",
      templateOptions: {
        id: 'trialRoomSystemsAmount',
        inputClass: 'columns medium-10',
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

    vm.hasCallEntitlement = Authinfo.isSquaredUC;
    vm.hasNextStep = hasNextStep;
    vm.previousStep = previousStep;
    vm.nextStep = nextStep;
    vm.finishSetup = finishSetup;
    vm.closeDialogBox = closeDialogBox;
    vm.editTrial = editTrial;
    vm.isProceedDisabled = isProceedDisabled;
    vm.getDaysLeft = getDaysLeft;
    vm.showDefaultFinish = showDefaultFinish;
    vm._helpers = {
      hasEnabled: hasEnabled,
      hasEnabledMessageTrial: hasEnabledMessageTrial,
      hasEnabledMeetingTrial: hasEnabledMeetingTrial,
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
        FeatureToggleService.supportsPstnSetup(),
        FeatureToggleService.supports(FeatureToggleService.features.atlasDeviceTrials)
      ]).then(function (results) {
        vm.showRoomSystems = results[0];
        vm.roomSystemTrial.enabled = results[0] && vm.preset.roomSystems;
        vm.meetingTrial.enabled = results[1] && vm.preset.meeting;
        vm.showMeeting = results[1];
        vm.supportsPstnSetup = results[2];
        vm.callTrial.enabled = vm.hasCallEntitlement() && vm.preset.call;
        vm.messageTrial.enabled = vm.preset.message;

        vm.canSeeDevicePage = results[3];

        if (vm.showMeeting) {
          updateTrialService(_messageTemplateOptionId);
        }

        setViewState('trialEdit.call', vm.canSeeDevicePage && results[1]);
        setViewState('trialEdit.meeting', results[1]);
        setViewState('trialEdit.addNumbers', !vm.supportsPstnSetup); //only show step if not supportsPstnSetup
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
      if (vm.callTrial.enabled || vm.roomSystemTrial.enabled) {
        vm.canEditMessage = false;
        vm.canEditMeeting = false;
        if (vm.showMeeting) {
          vm.meetingTrial.enabled = true;
        }
        vm.messageTrial.enabled = true;
      } else {
        vm.canEditMessage = true;
        vm.canEditMeeting = true;
      }

      vm.canEditMeeting = !vm.preset.meeting && vm.canEditMeeting;
      vm.canEditMessage = !vm.preset.message && vm.canEditMessage;

      setViewState('trialEdit.call', (hasEnabledRoomSystemTrial() || hasEnabledCallTrial() || canAddDevice()));
      setViewState('trialEdit.addNumbers', (hasEnabledCallTrial() && !vm.supportsPstnSetup)); //only show step if not supportsPstnSetup
      setViewState('trialEdit.meeting', hasEnabledMeetingTrial());

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

    function getNextState() {
      return _.chain(vm.navStates)
        .indexOf($state.current.name)
        .thru(function (index) {
          return _.slice(vm.navStates, index + 1);
        })
        .find(function (state) {
          return !_.isUndefined(state);
        })
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
        'name': modalStage
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

      // bail at first false result
      return _.reduce(checks, function (currentValue, sum) {
        if (!sum) {
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
        hasEnabledCallTrial(vm.callTrial, vmPreset) ||
        hasEnabledRoomSystemTrial(vm.roomSystemTrial, vmPreset);
    }

    function showDefaultFinish() {
      return !hasEnabledMeetingTrial(vm.meetingTrial, vm.preset);
    }

    function canAddDevice() {
      var stateDetails = vm.stateDetails.details;
      var roomSystemTrialEnabled = vm.roomSystemTrial.enabled;
      var callTrialEnabled = vm.callTrial.enabled;
      var canSeeDevicePage = vm.canSeeDevicePage;

      return TrialDeviceService.canAddDevice(stateDetails, roomSystemTrialEnabled, callTrialEnabled, canSeeDevicePage);
    }
  }
})();
