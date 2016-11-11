(function () {
  'use strict';

  angular.module('Core')
    .controller('EditServicesCtrl', EditServicesCtrl);
  /* @ngInject */
  function EditServicesCtrl($stateParams, $scope, Notification, CsdmDataModelService) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;
    vm.service = (wizardData.account.entitlements || []).indexOf('ciscouc') > -1 ? 'sparkCall' : 'sparkOnly';

    vm.next = function () {
      $stateParams.wizard.next({});
    };

    vm.save = function () {
      vm.isLoading = true;
      var entitlements = (wizardData.account.entitlements || []);
      var sparkCallIndex = entitlements.indexOf('ciscouc');
      if (sparkCallIndex > -1) {
        entitlements.splice(sparkCallIndex, 1);
        CsdmDataModelService.getPlacesMap().then(function (list) {
          var place = _.find(_.values(list), { 'cisUuid': wizardData.account.cisUuid });
          if (place) {
            CsdmDataModelService.updateCloudberryPlace(place, entitlements)
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
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };
  }
})();
