(function () {
  'use strict';

  angular.module('Core')
    .controller('EditServicesCtrl', EditServicesCtrl);
  /* @ngInject */
  function EditServicesCtrl($stateParams, $scope, Notification, CsdmDataModelService) {
    var ciscouc = 'ciscouc';
    var fusionec = 'squared-fusion-ec';
    var fusionuc = 'squared-fusion-uc';
    var fusionCal = 'squared-fusion-cal';
    var fusionGCal = 'squared-fusion-gcal';

    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    var initialService = getService(wizardData.account.entitlements);
    vm.service = initialService;
    var initialEnableCalService = getCalServiceEnabled(wizardData.account.entitlements);
    vm.sparkCallConnectEnabled = !!wizardData.csdmHybridCallFeature && wizardData.hybridCallEnabledOnOrg;
    vm.sparkCalendarPlaceEnabled = !!wizardData.csdmHybridCalendarFeature && wizardData.hybridCalendarEnabledOnOrg;
    vm.enableCalService = wizardData.account.enableCalService || initialEnableCalService;

    vm.next = function () {
      $stateParams.wizard.next({
        account: {
          entitlements: getUpdatedEntitlements(),
          enableCalService: vm.enableCalService,
        },
      }, vm.service === 'sparkOnly' && vm.enableCalService ? 'sparkOnlyAndCalendar' : vm.service);
    };

    vm.hasNextStep = function () {
      return wizardData.function !== 'editServices'
        || ((vm.service === 'sparkCall' || vm.service === 'sparkCallConnect') && vm.service !== initialService)
        || (vm.enableCalService && vm.enableCalService !== initialEnableCalService);
    };

    vm.hasBackStep = function () {
      return wizardData.function !== 'editServices';
    };

    function getUpdatedEntitlements() {
      var entitlements = (wizardData.account.entitlements || ['webex-squared', 'spark']);
      entitlements = _.difference(entitlements, [ciscouc, fusionec, fusionuc, fusionCal, fusionGCal]);
      if (vm.service === 'sparkCall') {
        entitlements.push(ciscouc);
      } else if (vm.service === 'sparkCallConnect') {
        entitlements.push(fusionec);
        entitlements.push(fusionuc);
      }
      if (vm.enableCalService) {
        _.intersection(wizardData.account.entitlements || [], [fusionCal, fusionGCal]).forEach(function (calEntitlement) {
          entitlements.push(calEntitlement);
        });
      }
      return entitlements;
    }

    function getService(entitlements) {
      var service = 'sparkOnly';

      _.intersection(entitlements || [], [ciscouc, fusionec]).forEach(function (entitlement) {
        switch (entitlement) {
          case ciscouc:
            service = 'sparkCall';
            break;
          case fusionec:
            service = 'sparkCallConnect';
            break;
          default:
        }
      });
      return service;
    }

    function getCalServiceEnabled(entitlements) {
      var serviceEnabled = false;
      _.intersection(entitlements || [], [fusionCal, fusionGCal]).forEach(function (entitlement) {
        switch (entitlement) {
          case fusionGCal:
          case fusionCal:
            serviceEnabled = true;
            break;
          default:
        }
      });
      return serviceEnabled;
    }

    vm.save = function () {
      if (vm.service === 'sparkOnly' || vm.enableCalService != initialEnableCalService) {
        vm.isLoading = true;
        if (vm.service !== initialService || vm.enableCalService != initialEnableCalService) {
          CsdmDataModelService.reloadPlace(wizardData.account.cisUuid).then(function (place) {
            if (place) {
              CsdmDataModelService.updateCloudberryPlace(place, getUpdatedEntitlements())
                .then(function () {
                  $scope.$dismiss();
                  Notification.success("addDeviceWizard.editServices.servicesSaved");
                }, function (error) {
                  Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
                });
            } else {
              vm.isLoading = false;
              Notification.warning('addDeviceWizard.assignPhoneNumber.placeNotFound');
            }
          }, function (error) {
            Notification.errorResponse(error, 'addDeviceWizard.assignPhoneNumber.placeEditError');
          });
        } else {
          $scope.$dismiss();
        }
      } else {
        $scope.$dismiss();
      }
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
