(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskUserController($stateParams, HelpdeskService, Orgservice, $log) {
    var vm = this;
    vm.user = $stateParams.user;
    vm.org = {};

    HelpdeskService.getUser(vm.user.organization.id, vm.user.id).then(function (res) {
      if (res) {
        vm.user = res;
      }
    }, function (err) {
      $log.error(err);
    });

    Orgservice.getAdminOrg(function (data, status) {
      if (data.success) {
        vm.org = data;
      } else {
        $log.error('Get org failed', status);
      }
    }, vm.user.organization.id, true);
  }

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);
}());
