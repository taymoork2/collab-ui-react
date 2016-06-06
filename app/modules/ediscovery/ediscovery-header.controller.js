(function () {
  'use strict';

  /* @ngInject */
  function EdiscoveryHeaderController($window, $scope) {

    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = "Activity Reports";
    });

    var vm = this;
    vm.pageTitle = "eDiscovery";
    vm.headerTabs = [{
      title: 'Search',
      state: 'ediscovery.search'
    }, {
      title: 'Reports',
      state: 'ediscovery.reports'
    }];
  }
  angular
    .module('Ediscovery')
    .controller('EdiscoveryHeaderController', EdiscoveryHeaderController);
}());
