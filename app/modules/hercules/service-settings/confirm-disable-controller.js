(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ConfirmDisableController', DisableConfirmController);

  /* @ngInject */
  function DisableConfirmController($modalInstance, $translate, Authinfo, CloudConnectorService, FusionUtils, Notification, ServiceDescriptor, serviceId) {
    var vm = this;
    vm.serviceId = serviceId;
    vm.serviceIconClass = FusionUtils.serviceId2Icon(serviceId);
    vm.serviceName = $translate.instant('hercules.serviceNames.' + serviceId);
    vm.connectorName = $translate.instant('hercules.connectorNames.' + serviceId);
    vm.companyName = Authinfo.getOrgName();
    vm.loading = false;

    vm.confirmDeactivation = function () {
      vm.loading = true;
      var disable = ServiceDescriptor.disableService;
      if (serviceId === 'squared-fusion-gcal') {
        disable = CloudConnectorService.deactivateService;
      }
      disable(serviceId)
        .then(function () {
          $modalInstance.close();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
          vm.loading = false;
        });

    };
    vm.cancel = function () {
      $modalInstance.dismiss();
    };
  }

}());
