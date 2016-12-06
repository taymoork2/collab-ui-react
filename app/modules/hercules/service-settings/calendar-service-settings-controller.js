(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CalendarSettingsController', CalendarSettingsController);

  /* @ngInject */
  function CalendarSettingsController($modal, $translate, $state) {
    var vm = this;
    vm.localizedServiceName = $translate.instant('hercules.serviceNames.squared-fusion-cal');
    vm.localizedConnectorName = $translate.instant('hercules.connectorNames.squared-fusion-cal');

    vm.deactivateSection = {
      title: 'common.deactivate'
    };

    vm.documentationSection = {
      title: 'common.help'
    };

    vm.confirmDisable = function (serviceId) {
      $modal.open({
        templateUrl: 'modules/hercules/service-settings/confirm-disable-dialog.html',
        type: 'small',
        controller: 'ConfirmDisableController',
        controllerAs: 'confirmDisableDialog',
        resolve: {
          serviceId: function () {
            return serviceId;
          }
        }
      }).result.then(function () {
        $state.go('services-overview');
      });
    };
  }
}());
