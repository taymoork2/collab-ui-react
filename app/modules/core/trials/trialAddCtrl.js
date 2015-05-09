(function () {
  'use strict';

  angular.module('Core')
    .controller('TrialAddCtrl', TrialAddCtrl);

  /* @ngInject */
  function TrialAddCtrl($scope, $state, $translate, $q, Authinfo, TrialService, HuronCustomer, Notification, Config, EmailService, ValidationService) {
    var vm = this;

    vm.customerOrgId = null;
    vm.nameError = false;
    vm.emailError = false;
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
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        type: 'text',
        required: true
      }
    }, {
      key: 'customerEmail',
      type: 'input',
      className: 'last-field',
      templateOptions: {
        label: $translate.instant('partnerHomePage.customerEmail'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
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
        class: 'col-xs-8 col-xs-offset-4'
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
        class: 'col-xs-8 col-xs-offset-4'
      },
      expressionProperties: {
        'hide': function () {
          return !vm.isSquaredUC;
        }
      }
    }, {
      key: 'licenseDuration',
      type: 'radio-list',
      templateOptions: {
        horizontal: true,
        label: $translate.instant('partnerHomePage.duration'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
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
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-3',
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

    function isOffersEmpty() {
      return !(vm.offers[Config.trials.collab] || vm.offers[Config.trials.squaredUC]);
    }

    function isSquaredUCEnabled() {
      return vm.offers[Config.trials.squaredUC];
    }

    function gotoAddNumber() {
      $state.go('trialAdd.addNumbers');
    }

    function startTrial(keepModal) {
      vm.nameError = false;
      vm.emailError = false;
      angular.element('#startTrialButton').button('loading');

      var offersList = [];
      for (var i in vm.offers) {
        if (vm.offers[i]) {
          offersList.push(i);
        }
      }

      return TrialService.startTrial(vm.model.customerName, vm.model.customerEmail, vm.model.licenseDuration, vm.model.licenseCount, vm.startDate, offersList)
        .catch(function (response) {
          angular.element('#startTrialButton').button('reset');
          Notification.notify([response.data.message], 'error');
          if ((response.data.message).indexOf('Org') > -1) {
            vm.nameError = true;
          } else if ((response.data.message).indexOf('Admin User') > -1) {
            vm.emailError = true;
          }
          return $q.reject(response);
        }).then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          if (offersList.indexOf(Config.trials.squaredUC) !== -1) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function (response) {
                angular.element('#startTrialButton').button('reset');
                Notification.errorResponse(response, 'trialModal.squareducError');
                return $q.reject(response);
              });
          } else {
            return EmailService.emailNotifyTrialCustomer(vm.customerEmail, vm.licenseDuration, vm.customerOrgId)
              .catch(function (response) {
                Notification.notify([$translate.instant('didManageModal.emailFailText')], 'error');
              });
          }
        }).then(function () {
          angular.element('#startTrialButton').button('reset');
          if (!keepModal) {
            $state.modal.close();
          }
          var successMessage = [$translate.instant('trialModal.addSuccess', {
            customerName: vm.model.customerName,
            licenseCount: vm.model.licenseCount,
            licenseDuration: vm.model.licenseDuration
          })];
          Notification.notify(successMessage, 'success');
          return vm.customerOrgId;
        });
    }
  }
})();
