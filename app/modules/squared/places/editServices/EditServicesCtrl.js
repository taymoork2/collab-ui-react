(function () {
  'use strict';

  angular.module('Core')
    .controller('EditServicesCtrl', EditServicesCtrl);
  /* @ngInject */
  function EditServicesCtrl($stateParams, $scope, Notification, CsdmDataModelService) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    var initialService = (wizardData.account.entitlements || []).indexOf('ciscouc') > -1 ? 'sparkCall' : 'sparkOnly';
    vm.service = initialService;

    vm.next = function () {
      $stateParams.wizard.next({
        account: {
          entitlements: getUpdatedEntitlements()
        }
      }, vm.service);
    };

    vm.hasNextStep = function () {
      return wizardData.function !== 'editServices' || (vm.service === 'sparkCall' && vm.service !== initialService);
    };

    function getUpdatedEntitlements() {
      var entitlements = (wizardData.account.entitlements || ['webex-squared']);
      var sparkCallIndex = entitlements.indexOf('ciscouc');
      if (vm.service === 'sparkOnly') {
        if (sparkCallIndex > -1) {
          entitlements.splice(sparkCallIndex, 1);
        }
      } else {
        if (sparkCallIndex == -1) {
          entitlements.push('ciscouc');
        }
      }
      return entitlements;
    }

    vm.save = function () {
      if (vm.service === 'sparkOnly') {
        vm.isLoading = true;
        if (vm.service !== initialService) {
          CsdmDataModelService.getPlacesMap().then(function (list) {
            var place = _.find(_.values(list), { 'cisUuid': wizardData.account.cisUuid });
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
