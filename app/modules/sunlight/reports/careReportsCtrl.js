(function () {
  'use strict';
  angular.module('Sunlight').controller('CareReportsController', CareReportsController);
  /* @ngInject */
  function CareReportsController($translate) {
    var vm = this;
    vm.timeFilter = null;
    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('reportsPage.today'),
      description: $translate.instant('reportsPage.today2')
    }, {
      value: 1,
      label: $translate.instant('reportsPage.week'),
      description: $translate.instant('reportsPage.week2')
    }, {
      value: 2,
      label: $translate.instant('reportsPage.month'),
      description: $translate.instant('reportsPage.month2')
    }, {
      value: 3,
      label: $translate.instant('reportsPage.year'),
      description: $translate.instant('reportsPage.year2')
    }];
    vm.timeSelected = vm.timeOptions[0];
  }
})();
