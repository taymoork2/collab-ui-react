(function () {
  'use strict';

  angular.module('Core')
    .controller('CallConnectOptionsCtrl', CallConnectOptionsCtrl);
  /* @ngInject */
  function CallConnectOptionsCtrl($stateParams, $scope, Notification) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    vm.title = wizardData.title;

    vm.next = function () {
      $stateParams.wizard.next({}, wizardData.account.enableCalService ? 'calendar' : vm.service);
    };

    vm.hasNextStep = function () {
      return wizardData.function !== 'editServices' || wizardData.account.enableCalService;
    };

    vm.back = function () {
      $stateParams.wizard.back();
    };

    vm.save = function () {
      Notification.success("not implemented at the moment");
      $scope.$dismiss();
    };
  }
})();
