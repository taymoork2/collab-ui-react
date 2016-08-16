(function () {
  'use strict';

  angular
    .module('Status')
    .controller('DashboardCtrl', DashboardCtrl);

  /* @ngInject */
  function DashboardCtrl($stateParams, $translate) {
    var vm = this;
    vm.pageTitle = $translate.instant('statusPage.pageTitle');

    vm.tab = $stateParams.tab;

    vm.headerTabs = [{
      title: $translate.instant('statusPage.dashboard'),
      state: 'status-dashboard'
    },
    {
      title: $translate.instant('statusPage.components'),
      state: 'status-components'
    },
    {
      title: $translate.instant('statusPage.incidents'),
      state: 'status'
    }];
  }
})();
