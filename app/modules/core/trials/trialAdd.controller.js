(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialAddCtrl', TrialAddCtrl);

  /* @ngInject */
  function TrialAddCtrl($q, $scope, $state, $translate, $window, Authinfo, Config, EmailService, FeatureToggleService, HuronCustomer, Notification, TrialPstnService, TrialService, ValidationService, Orgservice) {
    var vm = this;
    var _roomSystemDefaultQuantity = 5;
    var messageTemplateOptionId = 'messageTrial';
    var meetingTemplateOptionId = 'meetingTrial';
    var webexTemplateOptionId = 'webexTrial';
    var callTemplateOptionId = 'callTrial';
    var roomSystemsTemplateOptionId = 'roomSystemsTrial';
    var debounceTimeout = 2000;

    vm.trialData = TrialService.getData();

    vm.nameError = false;
    vm.emailError = false;
    vm.uniqueName = false;
    vm.uniqueEmail = false;
    vm.customerOrgId = undefined;
    vm.showRoomSystems = false;
    vm.details = vm.trialData.details;
    vm.messageTrial = vm.trialData.trials.messageTrial;
    vm.meetingTrial = vm.trialData.trials.meetingTrial;
    vm.webexTrial = vm.trialData.trials.webexTrial;
    vm.callTrial = vm.trialData.trials.callTrial;
    vm.roomSystemTrial = vm.trialData.trials.roomSystemTrial;
    vm.pstnTrial = vm.trialData.trials.pstnTrial;
    vm.trialStates = [{
      name: 'trialAdd.webex',
      trials: [vm.webexTrial],
      enabled: true,
    }, {
      name: 'trialAdd.call',
      trials: [vm.callTrial, vm.roomSystemTrial],
      enabled: true,
    }, {
      name: 'trialAdd.pstn',
      trials: [vm.pstnTrial],
      enabled: true,
    }, {
      name: 'trialAdd.emergAddress',
      trials: [vm.pstnTrial],
      enabled: true,
    }];
    // Navigate trial modal in this order
    vm.navOrder = ['trialAdd.info', 'trialAdd.webex', 'trialAdd.pstn', 'trialAdd.emergAddress', 'trialAdd.call'];
    vm.navStates = ['trialAdd.info'];
    vm.showWebex = false;
    vm.startTrial = startTrial;
    vm.setDeviceModal = setDeviceModal;
    vm.devicesModal = _.find(vm.trialStates, {
      name: 'trialAdd.call'
    });

    function validateField($viewValue, scope, key, uniqueFlag, errorMsg) {
      // Show loading glyph
      vm.loading = true;
      vm[errorMsg] = null;

      // Fetch list of trials based on email in edit box...
      return TrialService.shallowValidation(key, $viewValue).then(function (response) {
        vm.loading = false;
        if (angular.isDefined(response.unique)) {
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
      if ( angular.isUndefined(vm[key]) || vm[key] === "" ) {
        vm[key] = 'trialModal.errorFailSafe';
      }
      return $translate.instant(vm[key]);
    }

    vm.custInfoFields = [{
      model: vm.details,
      key: 'customerName',
      type: 'cs-input',
      templateOptions: {
        label: $translate.instant('partnerHomePage.customerName'),
        required: true,
        maxlength: 50,
        onKeydown: function (value, options) {
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
                }
                else {
                  reject();
                }
              });
            });
          },
          message: function() { return errorMessage('uniqueNameError'); },
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
        onKeydown: function (value, options) {
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
                }
                else {
                  reject();
                }
              });
            });
          },
          message: function() { return errorMessage('uniqueEmailError'); }
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

    vm.messageFields = [{
      // Message Trial
      model: vm.messageTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        id: messageTemplateOptionId,
        label: $translate.instant('trials.message')
      },
    }];

    vm.meetingFields = [{
      // Meeting Trial
      model: vm.meetingTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        id: meetingTemplateOptionId,
        label: $translate.instant('trials.meeting')
      },
    }, {
      // Webex Trial
      model: vm.webexTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        id: webexTemplateOptionId,
        label: $translate.instant('trials.webex')
      },
      hideExpression: function () {
        return !vm.showWebex;
      },
    }];

    vm.callFields = [{
      // Call Trial
      model: vm.callTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        id: callTemplateOptionId,
        label: $translate.instant('trials.callUsOnly')
      },
      hideExpression: function () {
        return !vm.hasCallEntitlement;
      }
    }];

    // Room Systems Trial
    vm.roomSystemFields = [{
      model: vm.roomSystemTrial,
      key: 'enabled',
      type: 'checkbox',
      className: '',
      templateOptions: {
        id: roomSystemsTemplateOptionId,
        label: $translate.instant('trials.roomSysUsOnly')
      },
      watcher: {
        listener: function (field, newValue, oldValue, scope, stopWatching) {
          if (newValue !== oldValue) {
            field.model.details.quantity = newValue ? _roomSystemDefaultQuantity : 0;
          }
        }
      }
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

    vm.licenseCountFields = [{
      model: vm.details,
      key: 'licenseCount',
      type: 'input',
      className: '',
      templateOptions: {
        label: $translate.instant('trials.licenseQuantity'),
        inputClass: 'medium-4',
        type: 'number',
        required: true,
        secondaryLabel: $translate.instant('trials.users'),
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
    }];

    vm.trialTermsFields = [{
      model: vm.details,
      key: 'licenseDuration',
      type: 'select',
      defaultValue: 30,
      templateOptions: {
        labelfield: 'label',
        required: true,
        label: $translate.instant('partnerHomePage.duration'),
        secondaryLabel: $translate.instant('partnerHomePage.durationHelp'),
        inputClass: 'medium-4',
        options: [30, 60, 90],
      },
    }];

    vm.hasCallEntitlement = true; // US12171 - always entitle call (previously Authinfo.isSquaredUC())
    vm.hasTrial = hasTrial;
    vm.hasNextStep = hasNextStep;
    vm.previousStep = previousStep;
    vm.nextStep = nextStep;
    vm.finishSetup = finishSetup;
    vm.closeDialogBox = closeDialogBox;
    vm.launchCustomerPortal = launchCustomerPortal;
    vm.showDefaultFinish = showDefaultFinish;
    vm.getNextState = getNextState;

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
        //vm.roomSystemTrial.enabled = results[0];
        vm.showRoomSystems = true;
        vm.roomSystemTrial.enabled = true;
        vm.webexTrial.enabled = results[1];
        vm.callTrial.enabled = vm.hasCallEntitlement;
        vm.pstnTrial.enabled = vm.hasCallEntitlement;
        vm.messageTrial.enabled = true;
        vm.meetingTrial.enabled = true;
        if (vm.webexTrial.enabled) {
          vm.showWebex = true;
          updateTrialService(messageTemplateOptionId);
        }

        // TODO: US12063 overrides using this var but requests code to be left in for now
        //var devicesModal = _.find(vm.trialStates, {
        //  name: 'trialAdd.call'
        // });
        var meetingModal = _.find(vm.trialStates, {
          name: 'trialAdd.webex'
        });
        var pstnModal = _.find(vm.trialStates, {
          name: 'trialAdd.pstn'
        });
        var emergAddressModal = _.find(vm.trialStates, {
          name: 'trialAdd.emergAddress'
        });

        pstnModal.enabled = vm.pstnTrial.enabled;
        emergAddressModal.enabled = vm.pstnTrial.enabled;
        meetingModal.enabled = results[1];
        // TODO: override atlasDeviceTrials to show Ship devices to all partners
        //       and only test orgs that have feature toggle enabled (US12063)
        //devicesModal.enabled = results[2];
        setDeviceModal();
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

        vm.roomSystemFields[1].model.quantity = vm.roomSystemTrial.enabled ? _roomSystemDefaultQuantity : 0;
        toggleTrial();
      });
    }

    // Update offer and label for Meetings/WebEx trial.
    function updateTrialService(templateOptionsId) {
      var index = _.findIndex(vm.messageFields, function (individualService) {
        return individualService.templateOptions.id === templateOptionsId;
      });
      if (index) {
        switch (templateOptionsId) {
        case messageTemplateOptionId:
          vm.messageFields[index].model.type = Config.offerTypes.message;
          vm.messageFields[index].templateOptions.label = $translate.instant('trials.message');
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
      return _.some(vm.trialData.trials, {
        enabled: true
      });
    }

    function hasNextStep() {
      return !_.isUndefined(getNextState());
    }

    function finishSetup() {
      $state.go('trialAdd.finishSetup');
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
        return startTrial(callback);
      } else {
        return $state.go(getNextState());
      }
    }

    /**
     * Changed to chain and slice the navOrder instead of navStates
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

    function startTrial(addNumbersCallback) {
      vm.nameError = false;
      vm.emailError = false;
      vm.loading = true;

      return TrialService.startTrial()
        .catch(function (response) {
          vm.loading = false;
          Notification.notify([response.data.message], 'error');
          if ((response.data.message).indexOf('Org') > -1) {
            vm.nameError = true;
          } else if ((response.data.message).indexOf('Admin User') > -1) {
            vm.emailError = true;
          }
          return $q.reject(response);
        })
        .then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          return response;
        })
        .then(function (response) {
          // suppress email if 'atlas-webex-trial' feature-toggle is enabled (more appropriately
          // handled by the backend process once provisioning is complete)
          if (!vm.webexTrial.enabled) {
            return EmailService.emailNotifyTrialCustomer(vm.details.customerEmail,
                vm.details.licenseDuration, Authinfo.getOrgId())
              .catch(function (response) {
                Notification.error('didManageModal.emailFailText');
              })
              .then(function () {
                return response;
              });
          }
          return response;
        })
        .then(function (response) {
          if (vm.callTrial.enabled) {
            return HuronCustomer.create(vm.customerOrgId, response.data.customerName, response.data.customerEmail)
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
          var successMessage = [$translate.instant('trialModal.addSuccess', {
            customerName: vm.details.customerName
          })];
          Notification.notify(successMessage, 'success');

          if (addNumbersCallback) {
            return addNumbersCallback(vm.customerOrgId)
              .catch(_.noop); //don't throw an error
          }
        })
        .then(function () {
          vm.finishSetup();
          return {
            customerOrgId: vm.customerOrgId
          };
        }).finally(function () {
          vm.loading = false;
        });
    }

    function closeDialogBox() {
      $state.modal.close();
    }

    function launchCustomerPortal() {
      $window.open($state.href('login_swap', {
        customerOrgId: vm.customerOrgId,
        customerOrgName: vm.details.customerName
      }));
      $state.modal.close();
    }

    function showDefaultFinish() {
      return !vm.webexTrial.enabled;
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
        vm.devicesModal.enabled = !isTestOrg || overrideTestOrg;
      });
    }
  }
})();
