(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialEditCtrl', TrialEditCtrl);

  /* @ngInject */
  function TrialEditCtrl($q, $state, $scope, $stateParams, $translate, Authinfo, TrialService, Notification, Config, HuronCustomer, ValidationService, FeatureToggleService) {
    var vm = this;

    vm.currentTrial = angular.copy($stateParams.currentTrial);
    vm.showPartnerEdit = $stateParams.showPartnerEdit;

    vm.editTerms = true;
    vm.disableSquaredUCCheckBox = false;
    $scope.offers = {};
    vm.showWebex = false;
    vm.showRoomSystems = false;
    vm.model = {
      roomSystems: 0
    };

    FeatureToggleService.supports(FeatureToggleService.features.atlasCloudberryTrials).then(function (result) {
      vm.showRoomSystems = result;
    });

    FeatureToggleService.supports(FeatureToggleService.features.atlasWebexTrials).then(function (result) {
      vm.showWebex = result;
      if (result) {
        vm.individualServices.splice(2, 0, webexField);
      }
    });

    var webexField = {
      key: Config.trials.meeting,
      type: 'checkbox',
      model: $scope.offers,
      templateOptions: {
        label: $translate.instant('trials.meet'),
        id: 'webexTrialCB',
        class: 'columns medium-12 checkbox-group'
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.isSquaredUCEnabled() || vm.isRoomSystemsTrialsEnabled();
        }
      }
    };

    vm.roomSystemOptions = [5, 10, 15, 20, 25];
    vm.individualServices = [{
      key: 'licenseCount',
      type: 'input',
      defaultValue: vm.currentTrial.licenses,
      templateOptions: {
        label: $translate.instant('siteList.licenseCount'),
        labelClass: 'columns medium-5',
        inputClass: 'columns medium-3',
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
    }, {
      key: Config.trials.message,
      type: 'checkbox',
      model: $scope.offers,
      defaultValue: _.get(vm, 'currentTrial.communications.status') === 'ACTIVE',
      templateOptions: {
        label: $translate.instant('trials.collab'),
        id: 'squaredTrial',
        class: 'columns medium-12 checkbox-group',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.isSquaredUCEnabled() || vm.isRoomSystemsTrialsEnabled() || _.get(vm, 'currentTrial.communications.status') === 'ACTIVE';
        },
        'templateOptions.label': function () {
          return FeatureToggleService.supports(FeatureToggleService.features.atlasStormBranding).then(function (result) {
            return result ? $translate.instant('partnerHomePage.message') : $translate.instant('trials.collab');
          });
        }
      }
    }, {
      key: Config.trials.call,
      type: 'checkbox',
      model: $scope.offers,
      templateOptions: {
        label: $translate.instant('trials.squaredUC'),
        id: 'squaredUCTrial',
        class: 'columns medium-12 checkbox-group',
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.disableSquaredUCCheckBox;
        },
        'hide': function () {
          return !vm.isSquaredUC();
        },
        'templateOptions.label': function () {
          return FeatureToggleService.supports(FeatureToggleService.features.atlasStormBranding).then(function (result) {
            return result ? $translate.instant('partnerHomePage.call') : $translate.instant('trials.squaredUC');
          });
        }
      }
    }];

    vm.trialTermsFields = [{
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
      }
    }];

    vm.isSquaredUC = Authinfo.isSquaredUC;
    vm.getDaysLeft = getDaysLeft;
    vm.editTrial = editTrial;
    vm.squaredUCOfferID = Config.trials.call;
    vm.roomSystemsOfferID = Config.trials.roomSystems;
    vm.isSquaredUCEnabled = isSquaredUCEnabled;
    vm.isRoomSystemsTrialsEnabled = isRoomSystemsTrialsEnabled;
    vm.gotoAddNumber = gotoAddNumber;
    vm.clickUpdateButton = clickUpdateButton;

    $scope.$watchCollection('offers', function (newOffers) {
      if (newOffers[Config.trials.roomSystems] || newOffers[Config.trials.call]) {
        $scope.offers[Config.trials.message] = true;
        if (vm.showWebex) {
          $scope.offers[Config.trials.meeting] = true;
        }
      }
    });

    initializeOffers();

    /////////////////

    function initializeOffers() {
      if (vm.currentTrial && vm.currentTrial.offers) {
        for (var i in vm.currentTrial.offers) {
          var offer = vm.currentTrial.offers[i];
          if (offer && offer.id) {
            $scope.offers[offer.id] = true;
            if (offer.id === vm.squaredUCOfferID) {
              vm.disableSquaredUCCheckBox = true;
            } else if (offer.id === vm.roomSystemsOfferID) {
              vm.model.roomSystemsEnabled = true;
              vm.model.roomSystems = offer.licenseCount;
            }
          }
        }
      }
    }

    function isSquaredUCEnabled() {
      return $scope.offers[Config.trials.call] || false;
    }

    function isRoomSystemsTrialsEnabled() {
      return $scope.offers[Config.trials.roomSystems] || false;
    }

    vm.roomSystemsChecked = function () {
      vm.model.roomSystems = vm.model.roomSystemsEnabled ? vm.roomSystemOptions[0] : 0;
      $scope.offers[Config.trials.roomSystems] = vm.model.roomSystemsEnabled;
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
      for (var i in $scope.offers) {
        if ($scope.offers[i]) {
          offersList.push(i);
        }
      }

      return TrialService.editTrial(vm.currentTrial.trialId, vm.model.licenseDuration, vm.model.licenseCount, vm.currentTrial.usage, vm.model.roomSystems, vm.currentTrial.customerOrgId, offersList)
        .catch(function (response) {
          vm.saveUpdateButtonLoad = false;
          Notification.notify([response.data.message], 'error');
          return $q.reject();
        })
        .then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          if ((offersList.indexOf(Config.trials.call) !== -1) && !vm.disableSquaredUCCheckBox) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function (response) {
                vm.saveUpdateButtonLoad = false;
                Notification.errorResponse(response, 'trialModal.squareducError');
                return $q.reject(response);
              });
          }
        })
        .then(function () {
          vm.saveUpdateButtonLoad = false;
          angular.extend($stateParams.currentTrial, vm.currentTrial);
          var successMessage = [$translate.instant('trialModal.editSuccess', {
            customerName: vm.currentTrial.customerName
          })];
          Notification.notify(successMessage, 'success');
          if (!keepModal) {
            $state.modal.close();
          }
        });
    }
  }
})();
