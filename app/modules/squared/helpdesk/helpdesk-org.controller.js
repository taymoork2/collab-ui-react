(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskOrgController($stateParams, HelpdeskService, XhrNotificationService, ServiceDescriptor, Authinfo) {
    var vm = this;
    vm.org = $stateParams.org;
    vm.hybridServicesEntitled = Authinfo.isFusion();

    HelpdeskService.getOrg(vm.org.id).then(function (res) {
      vm.org = res;
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    if (vm.hybridServicesEntitled) {
      ServiceDescriptor.servicesInOrg(vm.org.id).then(function (services) {
        vm.hybridServices = ServiceDescriptor.filterAllExceptManagement(services);
      }, function (err) {
        XhrNotificationService.notify(err);
      });
    }
  }

  angular
    .module('Squared')
    .controller('HelpdeskOrgController', HelpdeskOrgController);
}());
