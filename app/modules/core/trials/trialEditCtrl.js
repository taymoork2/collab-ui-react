(function () {
  'use strict';

  angular.module('Core')
    .controller('TrialEditCtrl', TrialEditCtrl);

  /* @ngInject */
  function TrialEditCtrl($q, $state, $scope, $stateParams, $translate, Authinfo, TrialService, Notification, Config, HuronCustomer, ValidationService) {
    var vm = this;

    vm.currentTrial = angular.copy($stateParams.currentTrial);
    vm.showPartnerEdit = $stateParams.showPartnerEdit;

    vm.editTerms = true;
    vm.disableSquaredUCCheckBox = false;
    vm.offers = {};

    vm.trialTermsFields = [{
      key: 'COLLAB',
      type: 'checkbox',
      model: vm.offers,
      templateOptions: {
        disabled: true,
        label: $translate.instant('trials.collab'),
        id: 'squaredTrial',
        class: 'small-8 small-offset-4 columns'
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
        },
        'templateOptions.disabled': function () {
          return vm.disableSquaredUCCheckBox || (!vm.showPartnerEdit && vm.editTerms);
        }
      }
    }, {
      key: 'duration',
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
      key: 'licenses',
      type: 'input',
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

    vm.isSquaredUC = Authinfo.isSquaredUC;
    vm.getDaysLeft = getDaysLeft;
    vm.editTrial = editTrial;
    vm.squaredUCOfferID = Config.trials.squaredUC;
    vm.isSquaredUCEnabled = isSquaredUCEnabled;
    vm.gotoAddNumber = gotoAddNumber;

    initializeOffers();

    /////////////////

    function initializeOffers() {
      if (vm.currentTrial && vm.currentTrial.offers) {
        for (var i in vm.currentTrial.offers) {
          var offer = vm.currentTrial.offers[i];
          if (offer && offer.id) {
            vm.offers[offer.id] = true;
            if (offer.id === vm.squaredUCOfferID) {
              vm.disableSquaredUCCheckBox = true;
            }
          }
        }
      }
    }

    function isSquaredUCEnabled() {
      return vm.offers[Config.trials.squaredUC];
    }

    function gotoAddNumber() {
      $state.go('trialEdit.addNumbers', {
        fromEditTrial: true,
        currentOrg: vm.currentTrial
      });
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

    function editTrial(keepModal) {
      angular.element('#saveUpdateButton').button('loading');

      var offersList = [];
      for (var i in vm.offers) {
        if (vm.offers[i]) {
          offersList.push(i);
        }
      }

      return TrialService.editTrial(vm.currentTrial.trialId, vm.currentTrial.duration, vm.currentTrial.licenses, vm.currentTrial.usage, vm.currentTrial.customerOrgId, offersList)
        .catch(function (response) {
          angular.element('#saveUpdateButton').button('reset');
          Notification.notify([response.data.message], 'error');
          return $q.reject();
        })
        .then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          if ((offersList.indexOf(Config.trials.squaredUC) !== -1) && !vm.disableSquaredUCCheckBox) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function () {
                angular.element('#saveUpdateButton').button('reset');
                Notification.errorResponse(response, 'trialModal.squareducError');
                return $q.reject();
              });
          }
        })
        .then(function () {
          angular.element('#saveUpdateButton').button('reset');
          angular.extend($stateParams.currentTrial, vm.currentTrial);
          var successMessage = [$translate.instant('trialModal.editSuccess', {
            customerName: vm.currentTrial.customerName,
            licenseCount: vm.currentTrial.licenses,
            licenseDuration: vm.currentTrial.duration
          })];
          Notification.notify(successMessage, 'success');
          if (!keepModal) {
            $state.modal.close();
          }
        });
    }
  }
})();
