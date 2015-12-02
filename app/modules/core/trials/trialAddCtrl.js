(function () {
  'use strict';

  angular.module('Core')
    .controller('TrialAddCtrl', TrialAddCtrl);

  /* @ngInject */
  function TrialAddCtrl($scope, $state, $translate, $q, Authinfo, TrialService, HuronCustomer, Notification, Config, EmailService, ValidationService, FeatureToggleService) {
    var vm = this;

    vm.nameError = false;
    vm.emailError = false;
    vm.supportsPstnSetup = false;
    vm.startDate = new Date();
    $scope.offers = {};
    vm.showRoomSystems = false;
    vm.showWebex = false;

    vm.model = {
      roomSystemsEnabled: true,
      roomSystems: 0,
      licenseCount: 100,
      licenseDuration: 90,
    };

    var webexField = {
      key: Config.trials.webex,
      type: 'checkbox',
      model: $scope.offers,
      templateOptions: {
        label: $translate.instant('trials.meet'),
        id: 'webexTrialCB',
        class: 'small-offset-1 columns',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          var disabled = false;
          if (vm.isSquaredUC()) {
            disabled = vm.isSquaredUCEnabled();
          }
          if (vm.showRoomSystems) {
            disabled = disabled || vm.isRoomSystemsTrialsEnabled();
          }
          return disabled;
        },
      },
    };

    vm.custInfoFields = [{
      key: 'customerName',
      type: 'input',
      templateOptions: {
        label: $translate.instant('partnerHomePage.customerName'),
        labelClass: 'small-4 columns',
        inputClass: 'small-7 columns left',
        type: 'text',
        required: true,
        maxlength: 50,
      },
    }, {
      key: 'customerEmail',
      type: 'input',
      className: 'last-field',
      templateOptions: {
        label: $translate.instant('partnerHomePage.customerEmail'),
        labelClass: 'small-4 columns',
        inputClass: 'small-7 columns left',
        type: 'email',
        required: true,
      },
    }];

    vm.roomSystemOptions = [5, 10, 15, 20, 25];
    vm.individualServices = [{
      key: 'licenseCount',
      type: 'input',
      templateOptions: {
        label: $translate.instant('siteList.licenseCount'),
        labelClass: 'small-4 columns',
        inputClass: 'small-4 columns left',
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
      key: Config.trials.collab,
      type: 'checkbox',
      model: $scope.offers,
      defaultValue: true,
      templateOptions: {
        label: $translate.instant('trials.collab'),
        id: 'squaredTrial',
        class: 'small-offset-1 columns'
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          var disabled = false;
          if (vm.isSquaredUC()) {
            disabled = vm.isSquaredUCEnabled();
          }
          if (vm.showRoomSystems) {
            disabled = disabled || vm.isRoomSystemsTrialsEnabled();
          }
          return disabled;
        },
        'templateOptions.label': function () {
          return FeatureToggleService.supports(FeatureToggleService.features.atlasStormBranding).then(function (result) {
            return result ? $translate.instant('partnerHomePage.message') : $translate.instant('trials.collab');
          });
        },
      },
    }, {
      key: Config.trials.squaredUC,
      type: 'checkbox',
      model: $scope.offers,
      templateOptions: {
        label: $translate.instant('trials.squaredUC'),
        id: 'squaredUCTrial',
        class: 'small-offset-1 columns',
      },
      expressionProperties: {
        'hide': function () {
          return !vm.isSquaredUC();
        },
        'templateOptions.label': function () {
          return FeatureToggleService.supports(FeatureToggleService.features.atlasStormBranding).then(function (result) {
            return result ? $translate.instant('partnerHomePage.call') : $translate.instant('trials.squaredUC');
          });
        },
      },
    }];

    vm.trialTermsFields = [{
      key: 'licenseDuration',
      type: 'select',
      defaultValue: 30,
      templateOptions: {
        labelfield: 'label',
        required: true,
        label: $translate.instant('partnerHomePage.duration'),
        secondaryLabel: $translate.instant('partnerHomePage.durationHelp'),
        labelClass: 'small-4 columns',
        inputClass: 'small-4 columns left',
        options: [30, 60, 90],
      },
    }];

    vm.roomSystemsChecked = function () {
      vm.model.roomSystems = vm.model.roomSystemsEnabled ? vm.roomSystemOptions[0] : 0;
      $scope.offers[Config.trials.cloudberry] = vm.model.roomSystemsEnabled;
    };

    $scope.$watchCollection('offers', function (newOffers) {
      if (newOffers[Config.trials.cloudberry] || newOffers[Config.trials.squaredUC]) {
        $scope.offers[Config.trials.collab] = true;
        if (vm.showWebex) {
          $scope.offers[Config.trials.webex] = true;
        }
      }
    });

    vm.isSquaredUC = Authinfo.isSquaredUC;
    vm.isOffersEmpty = isOffersEmpty;

    vm.startTrial = startTrial;
    vm.isSquaredUCEnabled = isSquaredUCEnabled;
    vm.isRoomSystemsTrialsEnabled = isRoomSystemsTrialsEnabled;
    vm.gotoAddNumber = gotoAddNumber;
    vm.clickStartTrial = clickStartTrial;

    init();

    ///////////////////////

    function init() {
      function setDefault(isTrue, object) {
        if (object) {
          object.defaultValue = isTrue;
        }
      }

      setDefault(vm.isSquaredUC(), _.find(vm.individualServices, {
        key: Config.trials.squaredUC,
      }));

      $q.all([
        FeatureToggleService.supportsPstnSetup(),
        FeatureToggleService.supports(FeatureToggleService.features.atlasCloudberryTrials),
        FeatureToggleService.supports(FeatureToggleService.features.atlasWebexTrials)
      ]).then(function (results) {
        vm.supportsPstnSetup = results[0];
        vm.showRoomSystems = results[1];
        vm.showWebex = results[2];
        if (vm.showWebex) {
          vm.individualServices.splice(2, 0, webexField);
        }
        setDefault(vm.showWebex, _.find(vm.individualServices, {
          key: Config.trials.webex,
        }));
        vm.model.roomSystemsEnabled = vm.showRoomSystems;
        vm.roomSystemsChecked();
      });
    }

    function clickStartTrial() {
      if (isSquaredUCEnabled()) {
        if (vm.supportsPstnSetup) {
          startTrial();
        } else {
          gotoAddNumber();
        }
      } else {
        startTrial();
      }
    }

    function isOffersEmpty() {
      return !($scope.offers[Config.trials.collab] || $scope.offers[Config.trials.squaredUC]);
    }

    function isSquaredUCEnabled() {
      return $scope.offers[Config.trials.squaredUC] || false;
    }

    function isRoomSystemsTrialsEnabled() {
      return $scope.offers[Config.trials.cloudberry] || false;
    }

    function gotoAddNumber() {
      $state.go('trialAdd.addNumbers');
    }

    function gotoNextSteps() {
      $state.go('trialAdd.nextSteps');
    }

    function startTrial(keepModal) {
      vm.nameError = false;
      vm.emailError = false;
      if (vm.supportsPstnSetup || !isSquaredUCEnabled()) {
        vm.startTrialButtonLoad = true;
      }

      var offersList = [];
      for (var i in $scope.offers) {
        if ($scope.offers[i]) {
          offersList.push(i);
        }
      }

      return TrialService.startTrial(vm.model.customerName, vm.model.customerEmail, vm.model.licenseDuration, vm.model.licenseCount, vm.model.roomSystems, vm.startDate, offersList)
        .catch(function (response) {
          vm.startTrialButtonLoad = false;
          Notification.notify([response.data.message], 'error');
          if ((response.data.message).indexOf('Org') > -1) {
            vm.nameError = true;
          } else if ((response.data.message).indexOf('Admin User') > -1) {
            vm.emailError = true;
          }
          return $q.reject(response);
        }).then(function (response) {
          vm.model.customerOrgId = response.data.customerOrgId;
          if (offersList.indexOf(Config.trials.squaredUC) !== -1) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function (response) {
                vm.startTrialButtonLoad = false;
                Notification.errorResponse(response, 'trialModal.squareducError');
                return $q.reject(response);
              });
          } else {
            return EmailService.emailNotifyTrialCustomer(vm.model.customerEmail, vm.model.licenseDuration, vm.model.customerOrgId)
              .catch(function (response) {
                Notification.notify([$translate.instant('didManageModal.emailFailText')], 'error');
              });
          }
        }).then(function () {
          vm.startTrialButtonLoad = false;

          var successMessage = [$translate.instant('trialModal.addSuccess', {
            customerName: vm.model.customerName,
            licenseCount: vm.model.licenseCount,
            licenseDuration: vm.model.licenseDuration
          })];
          Notification.notify(successMessage, 'success');

          if (offersList.indexOf(Config.trials.squaredUC) !== -1 && vm.supportsPstnSetup) {
            gotoNextSteps();
          } else if (!keepModal) {
            $state.modal.close();
          }

          return vm.model.customerOrgId;
        });
    }
  }
})();
