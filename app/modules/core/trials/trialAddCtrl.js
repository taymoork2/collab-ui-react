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
    vm.offers = {};
    vm.model = {
      licenseCount: 100,
      licenseDuration: 90,
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
        maxlength: 50
      }
    }, {
      key: 'customerEmail',
      type: 'input',
      className: 'last-field',
      templateOptions: {
        label: $translate.instant('partnerHomePage.customerEmail'),
        labelClass: 'small-4 columns',
        inputClass: 'small-7 columns left',
        type: 'email',
        required: true
      }
    }];

    vm.trialTermsFields = [{
      key: 'COLLAB',
      type: 'checkbox',
      model: vm.offers,
      templateOptions: {
        label: $translate.instant('trials.collab'),
        id: 'squaredTrial',
        class: 'small-8 small-offset-4 columns'
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.isSquaredUCEnabled();
        }
      }
    }, {
      key: 'SQUAREDUC',
      type: 'checkbox',
      model: vm.offers,
      templateOptions: {
        label: $translate.instant('trials.squaredUC'),
        id: 'squaredUCTrial',
        class: 'small-8 small-offset-4 columns'
      },
      expressionProperties: {
        'hide': function () {
          return !vm.isSquaredUC();
        }
      }
    }, {
      key: 'licenseDuration',
      type: 'radio-list',
      templateOptions: {
        horizontal: true,
        label: $translate.instant('partnerHomePage.duration'),
        labelClass: 'small-4 columns',
        inputClass: 'small-7 columns left',
        options: [{
          label: $translate.instant('partnerHomePage.ninetyDays'),
          value: 90,
          id: 'trial90'
        }, {
          label: $translate.instant('partnerHomePage.onehundredtwentyDays'),
          value: 120,
          id: 'trial120'
        }, {
          label: $translate.instant('partnerHomePage.onehundredeightyDays'),
          value: 180,
          id: 'trial180'
        }]
      }
    }, {
      key: 'licenseCount',
      type: 'input',
      className: 'last-field',
      templateOptions: {
        label: $translate.instant('partnerHomePage.numberOfLicenses'),
        labelClass: 'small-4 columns',
        inputClass: 'small-3 columns left',
        type: 'number',
        required: true
      },
      validators: {
        count: {
          expression: function ($viewValue, $modelValue) {
            return ValidationService.trialLicenseCount($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('partnerHomePage.invalidTrialLicenseCount');
          }
        }
      }
    }];

    $scope.$watch(function () {
      return vm.offers[Config.trials.squaredUC];
    }, function (newValue) {
      if (newValue) {
        vm.offers[Config.trials.collab] = true;
      }
    });

    vm.isSquaredUC = Authinfo.isSquaredUC;
    vm.isOffersEmpty = isOffersEmpty;

    vm.startTrial = startTrial;
    vm.isSquaredUCEnabled = isSquaredUCEnabled;
    vm.gotoAddNumber = gotoAddNumber;
    vm.clickStartTrial = clickStartTrial;

    init();

    ///////////////////////

    function init() {
      FeatureToggleService.supportsPstnSetup().then(function (isSupported) {
        vm.supportsPstnSetup = isSupported;
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
      return !(vm.offers[Config.trials.collab] || vm.offers[Config.trials.squaredUC]);
    }

    function isSquaredUCEnabled() {
      return vm.offers[Config.trials.squaredUC];
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
      for (var i in vm.offers) {
        if (vm.offers[i]) {
          offersList.push(i);
        }
      }

      return TrialService.startTrial(vm.model.customerName, vm.model.customerEmail, vm.model.licenseDuration, vm.model.licenseCount, vm.startDate, offersList)
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
