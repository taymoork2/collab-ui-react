(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskUserController($stateParams, Userservice, Orgservice) {
    var vm = this;
    vm.user = $stateParams.user;
    vm.org = {};

    Userservice.getUser(vm.user.id, function (data, status) {
      if (data.success) {
        vm.user = data
      } else {
        console.error('Get user failed', status);
      }
    });

    Orgservice.getAdminOrg(function (data, status) {
      if (data.success) {
        vm.org = data;
      } else {
        console.error('Get org failed', status);
      }
    }, vm.user.organizationId, true);
  }

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);
}());
