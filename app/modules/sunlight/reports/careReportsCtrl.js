(function () {
  'use strict';
  angular.module('Sunlight').controller('CareReportsController', CareReportsController);
  /* @ngInject */
  function CareReportsController($translate) {
    var vm = this;
    vm.timeFilter = null;
    var options = ["today", "yesterday", "week", "month", "threeMonths"];
    vm.timeOptions = _.map(options, function (name, i) {
      return {
        value: i,
        label: $translate.instant('reportsPage.' + name),
        description: $translate.instant('reportsPage.' + name + '2')
      };
    });
    vm.timeSelected = vm.timeOptions[0];
  }
})();
