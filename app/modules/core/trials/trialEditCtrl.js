(function () {
  'use strict';

  angular.module('Core')
    .controller('TrialEditCtrl', TrialEditCtrl);

  /* @ngInject */
  function TrialEditCtrl($q, $state, $scope, $stateParams, $translate, Authinfo, TrialService, Notification, Config, HuronCustomer, ValidationService, FeatureToggleService) {
    var vm = this;

    vm.currentTrial = angular.copy($stateParams.currentTrial);
    vm.showPartnerEdit = $stateParams.showPartnerEdit;

    vm.editTerms = true;
    vm.disableSquaredUCCheckBox = false;
    vm.offers = {};

    FeatureToggleService.supports(FeatureToggleService.features.atlasCloudberryTrials).then(function (result) {
      vm.showRoomSystems = result;
    });

    vm.roomSystemOptions = [5, 10, 15, 20, 25];
    vm.individualServices = [{
      key: 'licenseCount',
      type: 'input',
      defaultValue: vm.currentTrial.licenses,
      templateOptions: {
        label: $translate.instant('siteList.licenseCount'),
        labelClass: 'small-4 columns',
        inputClass: 'small-3 columns left',
        secondaryLabel: $translate.instant('common.users'),
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
      key: 'COLLAB',
      type: 'checkbox',
      model: vm.offers,
      defaultValue: _.get(vm, 'currentTrial.communications.status') === 'ACTIVE',
      templateOptions: {
        label: $translate.instant('trials.collab'),
        id: 'squaredTrial',
        class: 'small-offset-1 columns'
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.isSquaredUCEnabled() || _.get(vm, 'currentTrial.communications.status') === 'ACTIVE';
        },
        'templateOptions.label': function () {
          return FeatureToggleService.supports(FeatureToggleService.features.atlasStormBranding).then(function (result) {
            return result ? $translate.instant('partnerHomePage.message') : $translate.instant('trials.collab');
          });
        },
      },
    }, {
      key: 'SQUAREDUC',
      type: 'checkbox',
      model: vm.offers,
      templateOptions: {
        label: $translate.instant('trials.squaredUC'),
        id: 'squaredUCTrial',
        class: 'small-offset-1 columns'
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
        inputClass: 'small-3 columns left',
        options: [30, 60, 90],
      },
    }];

    vm.isSquaredUC = Authinfo.isSquaredUC;
    vm.getDaysLeft = getDaysLeft;
    vm.editTrial = editTrial;
    vm.squaredUCOfferID = Config.trials.squaredUC;
    vm.isSquaredUCEnabled = isSquaredUCEnabled;
    vm.gotoAddNumber = gotoAddNumber;
    vm.clickUpdateButton = clickUpdateButton;

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

    vm.roomSystemsChecked = function () {
      vm.model.roomSystems = vm.model.roomSystemsEnabled ? vm.roomSystemOptions[0] : 0;
    };

    function clickUpdateButton() {
      if (isSquaredUCEnabled() && !vm.disableSquaredUCCheckBox) {
        FeatureToggleService.supportsPstnSetup().then(function (isSupported) {
          if (isSupported) {
            editTrial();
          } else {
            gotoAddNumber();
          }
        });
      } else {
        editTrial();
      }
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
      vm.saveUpdateButtonLoad = true;

      var offersList = [];
      for (var i in vm.offers) {
        if (vm.offers[i]) {
          offersList.push(i);
        }
      }

      return TrialService.editTrial(vm.currentTrial.trialId, vm.currentTrial.duration, vm.currentTrial.licenses, vm.currentTrial.usage, vm.currentTrial.customerOrgId, offersList)
        .catch(function (response) {
          vm.saveUpdateButtonLoad = false;
          Notification.notify([response.data.message], 'error');
          return $q.reject();
        })
        .then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          if ((offersList.indexOf(Config.trials.squaredUC) !== -1) && !vm.disableSquaredUCCheckBox) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function () {
                vm.saveUpdateButtonLoad = false;
                Notification.errorResponse(response, 'trialModal.squareducError');
                return $q.reject();
              });
          }
        })
        .then(function () {
          vm.saveUpdateButtonLoad = false;
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
