(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerAdministratorOverviewCtrl', CustomerAdministratorOverview);

  /* @ngInject */
  function CustomerAdministratorOverview($scope, $state, $stateParams, ExternalNumberService, Notification) {
    var vm = this;
    vm.count = 0;
    vm.loading = true;
  }
})();
