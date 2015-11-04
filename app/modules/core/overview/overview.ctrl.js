(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($log, $translate) {
    var vm = this;
    vm.pageTitle = $translate.instant('overview.pageTitle');
    $log.log('hello world');
  }
})();
