(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryHeaderController($window, $scope, $translate) {

    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant("ediscovery.browserTabHeaderTitle");
    });

    var vm = this;
    vm.pageTitle = "eDiscovery";
    vm.headerTabs = [{
      title: $translate.instant("ediscovery.tabs.search"),
      state: 'ediscovery.search'
    }, {
      title: $translate.instant("ediscovery.tabs.reports"),
      state: 'ediscovery.reports'
    }];
  }
  angular
    .module('Ediscovery')
    .controller('EdiscoveryHeaderController', EdiscoveryHeaderController);
}());
