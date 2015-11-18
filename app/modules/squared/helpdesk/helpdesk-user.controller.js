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

    HelpdeskService.getOrg(vm.user.organization.id).then(function (res) {
      vm.org = res;
    }, function (err) {
      XhrNotificationService.notify(err);
    });
  }

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);
}());
