(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('MediaServiceReportsController', MediaServiceReportsController);

  /* @ngInject */
  function MediaServiceReportsController($translate, $stateParams) {
    var vm = this;

    vm.headerTabs = [{
      title: $translate.instant('mediaFusion.meetings-report.title'),
      state: 'media-service-v2.reports-meetings'
    }, {
      title: $translate.instant('mediaFusion.page_title'),
      state: 'media-service-v2.reports-metrics'
    }];
    vm.pageTitle = $translate.instant('reportsPage.pageTitle');

    vm.tab = $stateParams.tab;

  }
})();
