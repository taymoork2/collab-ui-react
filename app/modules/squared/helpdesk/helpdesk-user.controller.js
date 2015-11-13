(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskUserController($stateParams, HelpdeskService, Orgservice, XhrNotificationService) {
    var vm = this;
    vm.user = $stateParams.user;
    vm.org = {};

    HelpdeskService.getUser(vm.user.organization.id, vm.user.id).then(function (res) {
      vm.user = res;
    }, function (err) {
      XhrNotificationService.notify(err);
    });

    Orgservice.getAdminOrg(function (data, status) {
      if (data.success) {
        vm.org = data;
      } else {
        XhrNotificationService.notify(status);
      }
    }, vm.user.organization.id, true);
  }

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);
}());
