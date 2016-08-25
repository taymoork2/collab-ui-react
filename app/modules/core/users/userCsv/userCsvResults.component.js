(function () {
  'use strict';

  angular.module('Core')
    .component('crUserCsvResults', {
      controller: UserCsvResultsController,
      controllerAs: 'vm',
      templateUrl: 'modules/core/users/userCsv/userCsvResults.tpl.html',
      bindings: {
        onCancelImport: '&',
        csvData: '<'
      }
    });

  ////////////////////
  /* @ngInject */
  function UserCsvResultsController($scope) {
    var vm = this;

    vm.$onInit = onInit;

    //////////////

    function onInit() {
      $scope.csv = vm.csvData;
    }

  }

})();
